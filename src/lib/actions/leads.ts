// SPEC: CLAUDE.md > Use Server Actions for mutations
// DEP-MAP: Lead Management > SERVER > updateLead, updateLeadStage, createContact, convertLeadToClient
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads, contacts, clients, activityLog } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/db/client";
import { sendEmail } from "@/lib/email/client";
import { welcomeClient } from "@/lib/email/templates/welcome-client";
import { requireTeam } from "@/lib/auth/helpers";
import { getLeadById } from "@/lib/db/queries/leads";
import { getClientByEmail } from "@/lib/db/queries/clients";
import type { PipelineStage } from "@/lib/types/leads";
import type { ContactLogInput } from "@/lib/types/schemas";
import { env } from "@/lib/env";

export async function updateLead(
  id: string,
  data: {
    notes?: string;
    assignedTo?: string | null;
    pipelineStage?: PipelineStage;
  }
) {
  try {
    const user = await requireTeam();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.assignedTo !== undefined) updates.assignedTo = data.assignedTo;
    if (data.pipelineStage !== undefined) {
      updates.pipelineStage = data.pipelineStage;
      updates.pipelineStageChangedAt = new Date();
      if (data.pipelineStage === "contacted") {
        updates.lastContactedAt = new Date();
      }
    }

    const [updated] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: { code: "CB-DB-002", message: "Lead not found" } };
    }

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "lead.updated",
      entityType: "lead",
      entityId: id,
      metadata: { changes: Object.keys(updates).filter((k) => k !== "updatedAt") },
    }).catch(() => {});

    revalidatePath("/admin/leads");
    revalidatePath("/admin/pipeline");

    return { success: true, data: updated };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to update lead" } };
  }
}

export async function updateLeadStage(id: string, stage: PipelineStage) {
  try {
    const user = await requireTeam();

    const updates: Record<string, unknown> = {
      pipelineStage: stage,
      pipelineStageChangedAt: new Date(),
      updatedAt: new Date(),
    };

    if (stage === "contacted") {
      updates.lastContactedAt = new Date();
    }

    const [updated] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: { code: "CB-DB-002", message: "Lead not found" } };
    }

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "lead.stage_changed",
      entityType: "lead",
      entityId: id,
      metadata: { newStage: stage, leadName: updated.fullName },
    }).catch(() => {});

    revalidatePath("/admin/leads");
    revalidatePath("/admin/pipeline");

    return { success: true, data: updated };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to update stage" } };
  }
}

export async function createContact(leadId: string, data: ContactLogInput) {
  try {
    const user = await requireTeam();

    const [contact] = await db
      .insert(contacts)
      .values({
        leadId,
        type: data.type,
        subject: data.subject || null,
        body: data.body || null,
        direction: data.direction,
        createdBy: user.id,
      })
      .returning();

    await db
      .update(leads)
      .set({ lastContactedAt: new Date(), updatedAt: new Date() })
      .where(eq(leads.id, leadId));

    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "contact.created",
      entityType: "contact",
      entityId: contact.id,
      metadata: { leadId, type: data.type, direction: data.direction },
    }).catch(() => {});

    revalidatePath(`/admin/leads/${leadId}`);

    return { success: true, data: contact };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to log contact" } };
  }
}

export async function convertLeadToClient(leadId: string) {
  try {
    const user = await requireTeam();
    const lead = await getLeadById(leadId);

    if (!lead) {
      return { success: false, error: { code: "CB-DB-002", message: "Lead not found" } };
    }

    if (lead.convertedToClientId) {
      return { success: false, error: { code: "CB-DB-001", message: "Lead already converted" } };
    }

    // Check for existing client
    const existing = await getClientByEmail(lead.email);
    if (existing) {
      await db
        .update(leads)
        .set({ convertedToClientId: existing.id, updatedAt: new Date() })
        .where(eq(leads.id, leadId));

      revalidatePath("/admin/leads");
      revalidatePath("/admin/clients");
      return { success: true, data: existing };
    }

    // Create Supabase Auth account for client portal access
    let authUserId: string | null = null;
    try {
      const admin = createSupabaseAdminClient();
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: lead.email,
        email_confirm: true,
      });

      if (!authError && authData.user) {
        authUserId = authData.user.id;
      }
    } catch (err) {
      console.error("[CB-AUTH-010] Failed to create auth account:", err);
    }

    // Create client record
    const [client] = await db
      .insert(clients)
      .values({
        email: lead.email,
        fullName: lead.fullName,
        company: lead.companyName,
        phone: lead.phone,
        authUserId,
        createdBy: user.id,
      })
      .returning();

    // Update lead with converted_to_client_id
    await db
      .update(leads)
      .set({
        convertedToClientId: client.id,
        pipelineStage: "active_client",
        pipelineStageChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));

    // Send welcome email
    const template = welcomeClient({ fullName: client.fullName });
    sendEmail({
      to: client.email,
      subject: template.subject,
      html: template.html,
      from: env.EMAIL_FROM,
    }).catch((err) => console.error("[CB-INT-001] Welcome email failed:", err));

    // Log to activity_log
    await db.insert(activityLog).values({
      actorId: user.id,
      actorType: "team",
      action: "lead.converted",
      entityType: "lead",
      entityId: leadId,
      metadata: { clientId: client.id, clientEmail: client.email },
    }).catch(() => {});

    revalidatePath("/admin/leads");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/pipeline");

    return { success: true, data: client };
  } catch {
    return { success: false, error: { code: "CB-DB-001", message: "Failed to convert lead" } };
  }
}
