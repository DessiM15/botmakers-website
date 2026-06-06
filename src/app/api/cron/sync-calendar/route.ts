// SPEC: Google Calendar Integration > Cron > Calendar Sync (every 30 min)
import { NextRequest, NextResponse } from "next/server";
import { eq, and, lt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  calendarEvents,
  teamUsers,
  leads,
  clients,
} from "@/lib/db/schema";
import { getConnectedTeamMembers } from "@/lib/db/queries/calendar";
import { listGoogleCalendarEvents } from "@/lib/integrations/google-calendar";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let synced = 0;
  let created = 0;
  let errors = 0;

  try {
    const members = await getConnectedTeamMembers();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    for (const member of members) {
      if (!member.googleRefreshToken) continue;

      try {
        const googleEvents = await listGoogleCalendarEvents(
          member.googleRefreshToken,
          now,
          futureDate
        );

        for (const gEvent of googleEvents) {
          if (!gEvent.id || !gEvent.start?.dateTime) continue;

          const [existing] = await db
            .select()
            .from(calendarEvents)
            .where(eq(calendarEvents.googleEventId, gEvent.id))
            .limit(1);

          const attendees = (gEvent.attendees ?? []).map((a) => ({
            email: a.email ?? "",
            name: a.displayName ?? "",
            responseStatus: a.responseStatus ?? "",
          }));

          const meetingLink = gEvent.hangoutLink ?? null;

          if (existing) {
            // Update existing event
            await db
              .update(calendarEvents)
              .set({
                title: gEvent.summary ?? existing.title,
                description: gEvent.description ?? existing.description,
                startTime: new Date(gEvent.start.dateTime),
                endTime: new Date(gEvent.end?.dateTime ?? gEvent.start.dateTime),
                location: gEvent.location ?? existing.location,
                meetingLink: meetingLink ?? existing.meetingLink,
                attendees,
                googleHtmlLink: gEvent.htmlLink ?? existing.googleHtmlLink,
                syncedAt: now,
                updatedAt: now,
              })
              .where(eq(calendarEvents.id, existing.id));
            synced++;
          } else {
            // Find related lead/client by attendee email
            let relatedLeadId: string | null = null;
            let relatedClientId: string | null = null;

            for (const attendee of attendees) {
              if (!attendee.email) continue;

              if (!relatedLeadId) {
                const [lead] = await db
                  .select({ id: leads.id })
                  .from(leads)
                  .where(eq(leads.email, attendee.email))
                  .limit(1);
                if (lead) relatedLeadId = lead.id;
              }

              if (!relatedClientId) {
                const [client] = await db
                  .select({ id: clients.id })
                  .from(clients)
                  .where(eq(clients.email, attendee.email))
                  .limit(1);
                if (client) relatedClientId = client.id;
              }
            }

            await db.insert(calendarEvents).values({
              googleEventId: gEvent.id,
              title: gEvent.summary ?? "Untitled Event",
              description: gEvent.description ?? null,
              startTime: new Date(gEvent.start.dateTime),
              endTime: new Date(
                gEvent.end?.dateTime ?? gEvent.start.dateTime
              ),
              location: gEvent.location ?? null,
              meetingLink,
              attendees,
              eventType: "other",
              relatedLeadId,
              relatedClientId,
              createdBy: member.id,
              googleCalendarId: gEvent.organizer?.email ?? "primary",
              googleHtmlLink: gEvent.htmlLink ?? null,
              syncedAt: now,
            });
            created++;
          }
        }
      } catch (err) {
        console.error(
          `[CB-INT-006] Sync failed for ${member.email}:`,
          err
        );
        errors++;

        // If token is invalid, disconnect
        const errMsg = String(err);
        if (
          errMsg.includes("invalid_grant") ||
          errMsg.includes("Token has been expired or revoked")
        ) {
          await db
            .update(teamUsers)
            .set({
              googleCalendarConnected: false,
              googleRefreshToken: null,
              updatedAt: now,
            })
            .where(eq(teamUsers.id, member.id));
          console.warn(
            `[CB-INT-006] Disconnected expired Google Calendar for ${member.email}`
          );
        }
      }
    }

    // Cleanup: remove events older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await db
      .delete(calendarEvents)
      .where(lt(calendarEvents.startTime, thirtyDaysAgo))
      .catch(() => {});
  } catch (err) {
    console.error("[CB-INT-006] Calendar sync cron failed:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Synced ${synced}, created ${created}, errors ${errors}`,
  });
}
