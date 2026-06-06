// SPEC: SPEC-DATA-MODEL.md > notifications
import type { InferSelectModel } from "drizzle-orm";
import type { notifications } from "@/lib/db/schema";

export type Notification = InferSelectModel<typeof notifications>;

export type NotificationType =
  | "lead_new"
  | "lead_stage_change"
  | "proposal_accepted"
  | "payment_received"
  | "client_question"
  | "milestone_overdue"
  | "lead_stale"
  | "demo_shared"
  | "milestone_completed"
  | "meeting_booked";

export type NotificationChannel = "email" | "sms" | "in_app";
