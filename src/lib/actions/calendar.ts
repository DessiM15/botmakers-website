// SPEC: Google Calendar Integration > SERVER ACTIONS
// DEP-MAP: Calendar > createCalendarEvent, cancelCalendarEvent, connectGoogleCalendar
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  calendarEvents,
  bookingSettings,
  teamUsers,
  activityLog,
  leads,
} from "@/lib/db/schema";
import { requireTeam, requireAdmin } from "@/lib/auth/helpers";
import { calendarEventCreateSchema } from "@/lib/types/schemas";
import type { CalendarEventCreateInput } from "@/lib/types/schemas";
import {
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from "@/lib/integrations/google-calendar";

export async function createCalendarEvent(data: CalendarEventCreateInput) {
  const user = await requireTeam();

  const parsed = calendarEventCreateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: { code: "CB-API-002", message: "Invalid event data" },
    };
  }

  const input = parsed.data;
  const startTime = new Date(input.start_time);
  const endTime = new Date(input.end_time);

  let googleEventId: string | null = null;
  let meetingLink: string | null = null;
  let googleHtmlLink: string | null = null;

  // Create on Google Calendar if team member is connected
  if (user.googleRefreshToken && user.googleCalendarConnected) {
    const attendeeEmails = input.attendees.map((a) => a.email);
    const googleEvent = await createGoogleCalendarEvent(
      user.googleRefreshToken,
      {
        summary: input.title,
        description: input.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendeeEmails,
        addMeetLink: input.add_meet_link,
        location: input.location,
      }
    );

    if (googleEvent) {
      googleEventId = googleEvent.id ?? null;
      meetingLink = googleEvent.hangoutLink ?? null;
      googleHtmlLink = googleEvent.htmlLink ?? null;
    }
  }

  const [event] = await db
    .insert(calendarEvents)
    .values({
      googleEventId,
      title: input.title,
      description: input.description,
      startTime,
      endTime,
      meetingLink,
      location: input.location,
      attendees: input.attendees,
      eventType: input.event_type,
      relatedLeadId: input.related_lead_id ?? null,
      relatedClientId: input.related_client_id ?? null,
      relatedProjectId: input.related_project_id ?? null,
      createdBy: user.id,
      googleHtmlLink,
    })
    .returning();

  // If discovery call for a lead, update pipeline stage
  if (
    input.related_lead_id &&
    (input.event_type === "discovery_call" ||
      input.event_type === "demo_booking")
  ) {
    await db
      .update(leads)
      .set({
        pipelineStage: "discovery_scheduled",
        pipelineStageChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, input.related_lead_id))
      .catch(() => {});
  }

  await db
    .insert(activityLog)
    .values({
      actorId: user.id,
      action: "calendar_event.created",
      entityType: "calendar_event",
      entityId: event.id,
      metadata: { title: input.title, eventType: input.event_type },
    })
    .catch(() => {});

  revalidatePath("/admin/calendar");
  revalidatePath("/admin");

  return { success: true as const, data: event };
}

export async function cancelCalendarEvent(id: string) {
  const user = await requireTeam();

  const [existing] = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.id, id));

  if (!existing) {
    return {
      success: false as const,
      error: { code: "CB-DB-002", message: "Event not found" },
    };
  }

  // Delete from Google Calendar if synced
  if (existing.googleEventId && user.googleRefreshToken) {
    await deleteGoogleCalendarEvent(
      user.googleRefreshToken,
      existing.googleEventId
    );
  }

  await db
    .delete(calendarEvents)
    .where(eq(calendarEvents.id, id));

  await db
    .insert(activityLog)
    .values({
      actorId: user.id,
      action: "calendar_event.cancelled",
      entityType: "calendar_event",
      entityId: id,
      metadata: { title: existing.title },
    })
    .catch(() => {});

  revalidatePath("/admin/calendar");
  revalidatePath("/admin");

  return { success: true as const };
}

export async function updateBookingSettings(
  data: Record<string, unknown>
) {
  await requireAdmin();

  const [existing] = await db
    .select()
    .from(bookingSettings)
    .limit(1);

  if (existing) {
    await db
      .update(bookingSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookingSettings.id, existing.id));
  } else {
    await db.insert(bookingSettings).values(data);
  }

  revalidatePath("/admin/settings");
  return { success: true as const };
}

export async function connectGoogleCalendar(
  refreshToken: string,
  email: string
) {
  const user = await requireTeam();

  await db
    .update(teamUsers)
    .set({
      googleRefreshToken: refreshToken,
      googleCalendarConnected: true,
      googleCalendarEmail: email,
      updatedAt: new Date(),
    })
    .where(eq(teamUsers.id, user.id));

  await db
    .insert(activityLog)
    .values({
      actorId: user.id,
      action: "google_calendar.connected",
      entityType: "team_user",
      entityId: user.id,
      metadata: { email },
    })
    .catch(() => {});

  revalidatePath("/admin/settings");
  return { success: true as const };
}

export async function disconnectGoogleCalendar() {
  const user = await requireTeam();

  await db
    .update(teamUsers)
    .set({
      googleRefreshToken: null,
      googleCalendarConnected: false,
      googleCalendarEmail: null,
      updatedAt: new Date(),
    })
    .where(eq(teamUsers.id, user.id));

  await db
    .insert(activityLog)
    .values({
      actorId: user.id,
      action: "google_calendar.disconnected",
      entityType: "team_user",
      entityId: user.id,
    })
    .catch(() => {});

  revalidatePath("/admin/settings");
  return { success: true as const };
}
