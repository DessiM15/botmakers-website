// SPEC: Google Calendar Integration > QUERIES
// DEP-MAP: Calendar > getCalendarEvents, getUpcomingCalendarEvents, getBookingSettings
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  calendarEvents,
  bookingSettings,
  leads,
  clients,
  projects,
} from "@/lib/db/schema";
import type { CalendarEvent, CalendarEventWithRelations } from "@/lib/types/calendar";

interface CalendarEventFilters {
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function getCalendarEvents(
  filters?: CalendarEventFilters
): Promise<CalendarEventWithRelations[]> {
  const conditions = [];

  if (filters?.eventType) {
    conditions.push(eq(calendarEvents.eventType, filters.eventType));
  }
  if (filters?.startDate) {
    conditions.push(
      gte(calendarEvents.startTime, filters.startDate)
    );
  }
  if (filters?.endDate) {
    conditions.push(
      lte(calendarEvents.startTime, filters.endDate)
    );
  }

  const rows = await db
    .select({
      id: calendarEvents.id,
      googleEventId: calendarEvents.googleEventId,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
      location: calendarEvents.location,
      meetingLink: calendarEvents.meetingLink,
      attendees: calendarEvents.attendees,
      eventType: calendarEvents.eventType,
      relatedLeadId: calendarEvents.relatedLeadId,
      relatedProjectId: calendarEvents.relatedProjectId,
      relatedClientId: calendarEvents.relatedClientId,
      bookedByName: calendarEvents.bookedByName,
      bookedByEmail: calendarEvents.bookedByEmail,
      bookedByPhone: calendarEvents.bookedByPhone,
      bookedByCompany: calendarEvents.bookedByCompany,
      reminder24hSent: calendarEvents.reminder24hSent,
      reminder4hSent: calendarEvents.reminder4hSent,
      createdBy: calendarEvents.createdBy,
      googleCalendarId: calendarEvents.googleCalendarId,
      googleHtmlLink: calendarEvents.googleHtmlLink,
      syncedAt: calendarEvents.syncedAt,
      createdAt: calendarEvents.createdAt,
      updatedAt: calendarEvents.updatedAt,
      leadName: leads.fullName,
      leadPipelineStage: leads.pipelineStage,
      clientName: clients.fullName,
      projectName: projects.name,
    })
    .from(calendarEvents)
    .leftJoin(leads, eq(calendarEvents.relatedLeadId, leads.id))
    .leftJoin(clients, eq(calendarEvents.relatedClientId, clients.id))
    .leftJoin(projects, eq(calendarEvents.relatedProjectId, projects.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(calendarEvents.startTime))
    .limit(filters?.limit ?? 100)
    .offset(filters?.offset ?? 0);

  return rows as CalendarEventWithRelations[];
}

export async function getCalendarEventById(
  id: string
): Promise<CalendarEventWithRelations | null> {
  const [row] = await db
    .select({
      id: calendarEvents.id,
      googleEventId: calendarEvents.googleEventId,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startTime: calendarEvents.startTime,
      endTime: calendarEvents.endTime,
      location: calendarEvents.location,
      meetingLink: calendarEvents.meetingLink,
      attendees: calendarEvents.attendees,
      eventType: calendarEvents.eventType,
      relatedLeadId: calendarEvents.relatedLeadId,
      relatedProjectId: calendarEvents.relatedProjectId,
      relatedClientId: calendarEvents.relatedClientId,
      bookedByName: calendarEvents.bookedByName,
      bookedByEmail: calendarEvents.bookedByEmail,
      bookedByPhone: calendarEvents.bookedByPhone,
      bookedByCompany: calendarEvents.bookedByCompany,
      reminder24hSent: calendarEvents.reminder24hSent,
      reminder4hSent: calendarEvents.reminder4hSent,
      createdBy: calendarEvents.createdBy,
      googleCalendarId: calendarEvents.googleCalendarId,
      googleHtmlLink: calendarEvents.googleHtmlLink,
      syncedAt: calendarEvents.syncedAt,
      createdAt: calendarEvents.createdAt,
      updatedAt: calendarEvents.updatedAt,
      leadName: leads.fullName,
      leadPipelineStage: leads.pipelineStage,
      clientName: clients.fullName,
      projectName: projects.name,
    })
    .from(calendarEvents)
    .leftJoin(leads, eq(calendarEvents.relatedLeadId, leads.id))
    .leftJoin(clients, eq(calendarEvents.relatedClientId, clients.id))
    .leftJoin(projects, eq(calendarEvents.relatedProjectId, projects.id))
    .where(eq(calendarEvents.id, id));

  return (row as CalendarEventWithRelations) ?? null;
}

export async function getCalendarEventByGoogleId(
  googleEventId: string
): Promise<CalendarEvent | null> {
  const [row] = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.googleEventId, googleEventId));

  return row ?? null;
}

export async function getUpcomingCalendarEvents(
  days: number = 7,
  limit: number = 10
): Promise<CalendarEventWithRelations[]> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  return getCalendarEvents({
    startDate: now,
    endDate: future,
    limit,
  });
}

export async function getEventsForDateRange(
  start: Date,
  end: Date
): Promise<CalendarEvent[]> {
  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        gte(calendarEvents.startTime, start),
        lte(calendarEvents.startTime, end)
      )
    )
    .orderBy(calendarEvents.startTime);
}

export async function getBookingSettings() {
  const [row] = await db.select().from(bookingSettings).limit(1);
  return row ?? null;
}

export async function getEventsNeedingReminder(
  type: "24h" | "4h"
): Promise<CalendarEvent[]> {
  const now = new Date();
  const field =
    type === "24h"
      ? calendarEvents.reminder24hSent
      : calendarEvents.reminder4hSent;

  const hoursAhead = type === "24h" ? 24 : 4;
  const windowStart = new Date(
    now.getTime() + (hoursAhead - 0.5) * 60 * 60 * 1000
  );
  const windowEnd = new Date(
    now.getTime() + (hoursAhead + 0.5) * 60 * 60 * 1000
  );

  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        gte(calendarEvents.startTime, windowStart),
        lte(calendarEvents.startTime, windowEnd),
        eq(field, false),
        sql`${calendarEvents.bookedByEmail} IS NOT NULL`
      )
    );
}

export async function getCompletedUnloggedEvents(): Promise<CalendarEvent[]> {
  const now = new Date();

  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        lte(calendarEvents.endTime, now),
        sql`${calendarEvents.contactLoggedAt} IS NULL`,
        sql`(${calendarEvents.relatedLeadId} IS NOT NULL OR ${calendarEvents.relatedClientId} IS NOT NULL)`
      )
    )
    .orderBy(calendarEvents.endTime);
}

export async function getUpcomingEventsForLead(
  leadId: string
): Promise<CalendarEvent[]> {
  const now = new Date();

  return db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.relatedLeadId, leadId),
        gte(calendarEvents.startTime, now)
      )
    )
    .orderBy(calendarEvents.startTime);
}

export async function getConnectedTeamMembers() {
  const { teamUsers } = await import("@/lib/db/schema");
  return db
    .select()
    .from(teamUsers)
    .where(
      and(
        eq(teamUsers.googleCalendarConnected, true),
        eq(teamUsers.isActive, true)
      )
    );
}
