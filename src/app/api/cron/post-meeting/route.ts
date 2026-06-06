// SPEC: Calendar ↔ CRM Integration > Features 1 & 4
// Auto-log completed meetings as contacts + send follow-up emails
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { calendarEvents, contacts, leads, activityLog } from "@/lib/db/schema";
import { getCompletedUnloggedEvents } from "@/lib/db/queries/calendar";
import { sendEmail } from "@/lib/email/client";
import {
  meetingFollowUp,
  getNextStepsForEventType,
} from "@/lib/email/templates/meeting-followup";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let logged = 0;
  let followUpsSent = 0;

  try {
    const events = await getCompletedUnloggedEvents();

    for (const event of events) {
      // --- Feature 1: Auto-log contact ---
      const attendeeList = Array.isArray(event.attendees)
        ? (event.attendees as Array<{ email: string; name?: string }>)
        : [];
      const attendeeSummary = attendeeList
        .map((a) => a.name || a.email)
        .join(", ");
      const body = [
        attendeeSummary && `Attendees: ${attendeeSummary}`,
        event.description && `Notes: ${event.description}`,
      ]
        .filter(Boolean)
        .join("\n");

      await db.insert(contacts).values({
        leadId: event.relatedLeadId ?? null,
        clientId: event.relatedClientId ?? null,
        type: "meeting",
        subject: event.title,
        body: body || null,
        direction: "outbound",
      });

      // Update lead's lastContactedAt
      if (event.relatedLeadId) {
        await db
          .update(leads)
          .set({ lastContactedAt: new Date(), updatedAt: new Date() })
          .where(eq(leads.id, event.relatedLeadId));

        // Auto-advance discovery_scheduled → discovery_completed
        await db
          .update(leads)
          .set({
            pipelineStage: "discovery_completed",
            pipelineStageChangedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            sql`${leads.id} = ${event.relatedLeadId} AND ${leads.pipelineStage} = 'discovery_scheduled'`
          );
      }

      // Mark as logged
      await db
        .update(calendarEvents)
        .set({ contactLoggedAt: new Date() })
        .where(eq(calendarEvents.id, event.id));

      // Activity log
      await db
        .insert(activityLog)
        .values({
          actorType: "system",
          action: "contact.auto_logged",
          entityType: "calendar_event",
          entityId: event.id,
          metadata: {
            meetingTitle: event.title,
            leadId: event.relatedLeadId,
            clientId: event.relatedClientId,
          },
        })
        .catch(() => {});

      logged++;

      // --- Feature 4: Follow-up email ---
      if (event.followUpSentAt || event.eventType === "internal") continue;

      // Determine recipient email
      let recipientEmail: string | null = null;
      let recipientName: string | null = null;

      if (event.bookedByEmail) {
        recipientEmail = event.bookedByEmail;
        recipientName = event.bookedByName;
      } else if (event.relatedLeadId) {
        const [lead] = await db
          .select({ email: leads.email, fullName: leads.fullName })
          .from(leads)
          .where(eq(leads.id, event.relatedLeadId))
          .limit(1);
        if (lead) {
          recipientEmail = lead.email;
          recipientName = lead.fullName;
        }
      } else if (event.relatedClientId) {
        const { clients } = await import("@/lib/db/schema");
        const [client] = await db
          .select({ email: clients.email, fullName: clients.fullName })
          .from(clients)
          .where(eq(clients.id, event.relatedClientId!))
          .limit(1);
        if (client) {
          recipientEmail = client.email;
          recipientName = client.fullName;
        }
      }

      if (!recipientEmail) continue;

      const startDate = new Date(event.startTime);
      const template = meetingFollowUp({
        recipientName: recipientName ?? "there",
        meetingTitle: event.title,
        meetingDate: startDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        }),
        nextSteps: getNextStepsForEventType(event.eventType),
      });

      sendEmail({
        to: recipientEmail,
        subject: template.subject,
        html: template.html,
      }).catch((err) =>
        console.error("[CB-INT-001] Meeting follow-up email failed:", err)
      );

      await db
        .update(calendarEvents)
        .set({ followUpSentAt: new Date() })
        .where(eq(calendarEvents.id, event.id));

      followUpsSent++;
    }
  } catch (err) {
    console.error("[CB-INT-006] Post-meeting cron failed:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Logged ${logged} meetings, sent ${followUpsSent} follow-up emails`,
  });
}
