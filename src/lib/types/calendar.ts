// SPEC: Google Calendar Integration > TYPES
import type { InferSelectModel } from "drizzle-orm";
import type { calendarEvents, bookingSettings } from "@/lib/db/schema";

export type CalendarEvent = InferSelectModel<typeof calendarEvents>;
export type BookingSetting = InferSelectModel<typeof bookingSettings>;

export type EventType =
  | "discovery_call"
  | "client_meeting"
  | "internal"
  | "follow_up"
  | "demo_booking"
  | "other";

export interface Attendee {
  email: string;
  name: string;
  responseStatus?: string;
}

export interface CalendarEventWithRelations extends CalendarEvent {
  leadName: string | null;
  leadPipelineStage: string | null;
  clientName: string | null;
  projectName: string | null;
}
