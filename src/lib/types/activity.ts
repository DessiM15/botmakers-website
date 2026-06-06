// SPEC: SPEC-DATA-MODEL.md > activity_log, audit_log
import type { InferSelectModel } from "drizzle-orm";
import type { activityLog, auditLog } from "@/lib/db/schema";

export type ActivityLogEntry = InferSelectModel<typeof activityLog>;
export type AuditLogEntry = InferSelectModel<typeof auditLog>;
