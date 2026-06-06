// SPEC: SPEC-DEPENDENCY-MAP > Notification System > Cron > stale leads
// DEP-MAP: Cron > GET /api/cron/stale-leads
import { NextRequest, NextResponse } from "next/server";
import { getStaleLeads } from "@/lib/db/queries/leads";
import { sendEmail } from "@/lib/email/client";
import { staleLeadAlert } from "@/lib/email/templates/stale-lead-alert";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { PIPELINE_STAGE_LABELS } from "@/lib/types/constants";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const staleLeads = await getStaleLeads(7);

    if (staleLeads.length === 0) {
      return NextResponse.json({ success: true, message: "No stale leads" });
    }

    const teamEmails = env.TEAM_NOTIFICATION_EMAILS
      ? env.TEAM_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : [];

    if (teamEmails.length === 0) {
      return NextResponse.json({ success: true, message: "No team emails configured" });
    }

    const now = new Date();
    const template = staleLeadAlert({
      leads: staleLeads.map((l) => ({
        fullName: l.fullName,
        email: l.email,
        daysSinceChange: Math.floor((now.getTime() - new Date(l.pipelineStageChangedAt).getTime()) / (1000 * 60 * 60 * 24)),
        stage: PIPELINE_STAGE_LABELS[l.pipelineStage] ?? l.pipelineStage,
      })),
    });

    await sendEmail({ to: teamEmails, subject: template.subject, html: template.html });

    // Log notification
    await db.insert(notifications).values({
      type: "lead_stale",
      channel: "email",
      recipientEmail: teamEmails.join(", "),
      subject: template.subject,
      body: `${staleLeads.length} stale leads`,
      sentAt: new Date(),
    }).catch(() => {});

    return NextResponse.json({ success: true, staleCount: staleLeads.length });
  } catch (err) {
    console.error("[GET /api/cron/stale-leads] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
