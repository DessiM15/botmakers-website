// SPEC: SPEC-PAGES > /admin/settings
// DEP-MAP: Settings > SERVER > inviteTeamMember, updateSetting
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { teamUsers, systemSettings, activityLog } from "@/lib/db/schema";
import { requireAdmin, requireTeam } from "@/lib/auth/helpers";
import { createSupabaseAdminClient } from "@/lib/db/client";

export async function inviteTeamMember(data: {
  email: string;
  fullName: string;
  role: "admin" | "member";
}) {
  try {
    const user = await requireAdmin();

    // Create Supabase Auth account
    const admin = createSupabaseAdminClient();
    const { error: authError } = await admin.auth.admin.createUser({
      email: data.email,
      email_confirm: true,
    });

    if (authError) {
      console.error("[CB-AUTH-010] Failed to create auth for team member:", authError);
    }

    // Insert team user record
    const [member] = await db
      .insert(teamUsers)
      .values({
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      })
      .returning();

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "team_member.invited",
        entityType: "team_user",
        entityId: member.id,
        metadata: { email: data.email, role: data.role },
      })
      .catch(() => {});

    revalidatePath("/admin/settings");
    return { success: true, data: member };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to invite team member" },
    };
  }
}

export async function toggleTeamMemberActive(memberId: string) {
  try {
    await requireAdmin();

    const [member] = await db
      .select()
      .from(teamUsers)
      .where(eq(teamUsers.id, memberId))
      .limit(1);

    if (!member) {
      return { success: false, error: { code: "CB-DB-002", message: "Member not found" } };
    }

    const [updated] = await db
      .update(teamUsers)
      .set({ isActive: !member.isActive, updatedAt: new Date() })
      .where(eq(teamUsers.id, memberId))
      .returning();

    revalidatePath("/admin/settings");
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to update member" },
    };
  }
}

export async function getSystemSetting(key: string) {
  const [setting] = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.key, key))
    .limit(1);

  return setting?.value ?? null;
}

export async function updateSystemSetting(key: string, value: unknown) {
  try {
    const user = await requireTeam();

    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(systemSettings)
        .set({ value, updatedBy: user.id, updatedAt: new Date() })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({
        key,
        value,
        updatedBy: user.id,
      });
    }

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "setting.updated",
        entityType: "setting",
        entityId: key,
        metadata: { key, value },
      })
      .catch(() => {});

    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to update setting" },
    };
  }
}

export async function getTeamMembers() {
  return db
    .select()
    .from(teamUsers)
    .orderBy(teamUsers.fullName);
}

export async function getAllSettings() {
  const rows = await db.select().from(systemSettings);
  const map: Record<string, unknown> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map;
}
