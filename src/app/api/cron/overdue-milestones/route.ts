// SPEC: SPEC-DEPENDENCY-MAP > Notification System > Cron > overdue milestones
// DEP-MAP: Cron > GET /api/cron/overdue-milestones
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projectMilestones, notifications } from "@/lib/db/schema";
import { getOverdueMilestones } from "@/lib/db/queries/projects";
import { sendEmail } from "@/lib/email/client";
import { overdueAlert } from "@/lib/email/templates/overdue-alert";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const overdue = await getOverdueMilestones();

    if (overdue.length === 0) {
      return NextResponse.json({ success: true, message: "No overdue milestones" });
    }

    // Update status to overdue
    for (const item of overdue) {
      await db
        .update(projectMilestones)
        .set({ status: "overdue", updatedAt: new Date() })
        .where(eq(projectMilestones.id, item.milestone.id));
    }

    const teamEmails = env.TEAM_NOTIFICATION_EMAILS
      ? env.TEAM_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : [];

    if (teamEmails.length > 0) {
      const template = overdueAlert({
        milestones: overdue.map((item) => ({
          title: item.milestone.title,
          projectName: item.project.name,
          dueDate: item.milestone.dueDate ?? "N/A",
        })),
      });

      await sendEmail({ to: teamEmails, subject: template.subject, html: template.html });

      await db.insert(notifications).values({
        type: "milestone_overdue",
        channel: "email",
        recipientEmail: teamEmails.join(", "),
        subject: template.subject,
        body: `${overdue.length} overdue milestones`,
        sentAt: new Date(),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, overdueCount: overdue.length });
  } catch (err) {
    console.error("[GET /api/cron/overdue-milestones] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
