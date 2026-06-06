// SPEC: CLAUDE.md > Use Server Actions for mutations
// DEP-MAP: AI Proposal Generation > SERVER > createProposal, updateProposal, sendProposal
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  proposals,
  proposalLineItems,
  activityLog,
} from "@/lib/db/schema";
import { requireTeam } from "@/lib/auth/helpers";
import { sendEmail } from "@/lib/email/client";
import { proposalSent } from "@/lib/email/templates/proposal-sent";
import { proposalAcceptedAlert } from "@/lib/email/templates/proposal-accepted";
import { kickoffSuggestion } from "@/lib/email/templates/kickoff-suggestion";
import { getProposalById } from "@/lib/db/queries/proposals";
import type { ProposalCreateInput } from "@/lib/types/schemas";
import { env } from "@/lib/env";

export async function createProposal(data: ProposalCreateInput) {
  try {
    const user = await requireTeam();

    const totalAmount = data.line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    const [proposal] = await db
      .insert(proposals)
      .values({
        title: data.title,
        leadId: data.lead_id || null,
        clientId: data.client_id || null,
        scopeOfWork: data.scope_of_work,
        deliverables: data.deliverables,
        termsAndConditions: data.terms_and_conditions,
        pricingType: data.pricing_type,
        totalAmount: String(totalAmount),
        aiGenerated: !!data.ai_prompt_context,
        aiPromptContext: data.ai_prompt_context || null,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        createdBy: user.id,
      })
      .returning();

    // Insert line items
    if (data.line_items.length > 0) {
      await db.insert(proposalLineItems).values(
        data.line_items.map((item, idx) => ({
          proposalId: proposal.id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unit_price),
          total: String(item.quantity * item.unit_price),
          sortOrder: item.sort_order ?? idx,
          phaseLabel: item.phase_label || null,
        }))
      );
    }

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "proposal.created",
        entityType: "proposal",
        entityId: proposal.id,
        metadata: { title: proposal.title, totalAmount },
      })
      .catch(() => {});

    revalidatePath("/admin/proposals");
    return { success: true, data: proposal };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to create proposal" },
    };
  }
}

export async function updateProposal(
  id: string,
  data: Partial<ProposalCreateInput>
) {
  try {
    const user = await requireTeam();

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) updates.title = data.title;
    if (data.scope_of_work !== undefined)
      updates.scopeOfWork = data.scope_of_work;
    if (data.deliverables !== undefined)
      updates.deliverables = data.deliverables;
    if (data.terms_and_conditions !== undefined)
      updates.termsAndConditions = data.terms_and_conditions;
    if (data.pricing_type !== undefined)
      updates.pricingType = data.pricing_type;

    if (data.line_items) {
      const totalAmount = data.line_items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      updates.totalAmount = String(totalAmount);

      // Replace line items
      await db
        .delete(proposalLineItems)
        .where(eq(proposalLineItems.proposalId, id));
      await db.insert(proposalLineItems).values(
        data.line_items.map((item, idx) => ({
          proposalId: id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unit_price),
          total: String(item.quantity * item.unit_price),
          sortOrder: item.sort_order ?? idx,
          phaseLabel: item.phase_label || null,
        }))
      );
    }

    const [updated] = await db
      .update(proposals)
      .set(updates)
      .where(eq(proposals.id, id))
      .returning();

    if (!updated) {
      return {
        success: false,
        error: { code: "CB-DB-002", message: "Proposal not found" },
      };
    }

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "proposal.updated",
        entityType: "proposal",
        entityId: id,
      })
      .catch(() => {});

    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/admin/proposals");
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to update proposal" },
    };
  }
}

export async function sendProposal(id: string) {
  try {
    const user = await requireTeam();
    const proposalData = await getProposalById(id);

    if (!proposalData) {
      return {
        success: false,
        error: { code: "CB-DB-002", message: "Proposal not found" },
      };
    }

    const recipientEmail =
      proposalData.clientEmail ?? proposalData.leadEmail;
    const recipientName =
      proposalData.clientName ?? proposalData.leadName ?? "Client";

    if (!recipientEmail) {
      return {
        success: false,
        error: {
          code: "CB-API-001",
          message: "No recipient email found",
        },
      };
    }

    // Update status
    const [updated] = await db
      .update(proposals)
      .set({
        status: "sent",
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();

    // Send email to client
    const template = proposalSent({
      clientName: recipientName,
      proposalTitle: proposalData.proposal.title,
      totalAmount: proposalData.proposal.totalAmount,
    });
    sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
      from: env.EMAIL_FROM,
    }).catch((err) =>
      console.error("[CB-INT-001] Proposal send email failed:", err)
    );

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "proposal.sent",
        entityType: "proposal",
        entityId: id,
        metadata: { recipientEmail, title: proposalData.proposal.title },
      })
      .catch(() => {});

    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/admin/proposals");
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to send proposal" },
    };
  }
}

export async function acceptProposal(id: string, signature: string) {
  try {
    const { requireClient } = await import("@/lib/auth/helpers");
    const client = await requireClient();

    const proposalData = await getProposalById(id);
    if (!proposalData) {
      return {
        success: false,
        error: { code: "CB-DB-002", message: "Proposal not found" },
      };
    }

    const status = proposalData.proposal.status;
    if (status !== "sent" && status !== "viewed") {
      return {
        success: false,
        error: {
          code: "CB-API-002",
          message: `Cannot accept a proposal in '${status}' status`,
        },
      };
    }

    const [updated] = await db
      .update(proposals)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        clientSignature: signature,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();

    // Notify team
    const teamEmails = env.TEAM_NOTIFICATION_EMAILS
      ? env.TEAM_NOTIFICATION_EMAILS.split(",")
          .map((e) => e.trim())
          .filter(Boolean)
      : [];

    if (teamEmails.length > 0) {
      const template = proposalAcceptedAlert({
        clientName: client.fullName,
        proposalTitle: proposalData.proposal.title,
        totalAmount: proposalData.proposal.totalAmount,
      });
      sendEmail({
        to: teamEmails,
        subject: template.subject,
        html: template.html,
      }).catch((err) =>
        console.error("[CB-INT-001] Proposal accepted alert failed:", err)
      );

      // Send kickoff meeting suggestion
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "https://botmakers.ai";
      const adminUrl = proposalData.proposal.leadId
        ? `${appUrl}/admin/leads/${proposalData.proposal.leadId}`
        : `${appUrl}/admin/proposals/${id}`;
      const kickoffTemplate = kickoffSuggestion({
        clientName: client.fullName,
        projectTitle: proposalData.proposal.title,
        proposalTitle: proposalData.proposal.title,
        adminUrl,
      });
      sendEmail({
        to: teamEmails,
        subject: kickoffTemplate.subject,
        html: kickoffTemplate.html,
      }).catch((err) =>
        console.error("[CB-INT-001] Kickoff suggestion email failed:", err)
      );
    }

    await db
      .insert(activityLog)
      .values({
        actorType: "client",
        action: "proposal.accepted",
        entityType: "proposal",
        entityId: id,
        metadata: {
          clientId: client.id,
          title: proposalData.proposal.title,
        },
      })
      .catch(() => {});

    revalidatePath(`/portal/proposals/${id}`);
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: {
        code: "CB-DB-001",
        message: "Failed to accept proposal",
      },
    };
  }
}

export async function trackProposalView(id: string) {
  try {
    await db
      .update(proposals)
      .set({
        viewedAt: new Date(),
        status: "viewed",
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id));

    await db
      .insert(activityLog)
      .values({
        actorType: "client",
        action: "proposal.viewed",
        entityType: "proposal",
        entityId: id,
      })
      .catch(() => {});
  } catch {
    // Non-critical, don't crash
  }
}
