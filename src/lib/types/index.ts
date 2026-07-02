// SPEC: All types re-exported from a single entry point
export type { TeamUser, TeamUserRole } from "./team";
export type {
  Lead,
  LeadSource,
  LeadScore,
  PipelineStage,
  LeadFilters,
  AIAnalysis,
  LeadWithAnalysis,
} from "./leads";
export type { Client, ClientWithProjects } from "./clients";
export type {
  Project,
  ProjectPhase,
  ProjectMilestone,
  ProjectRepo,
  ProjectDemo,
  ProjectQuestion,
  ProjectStatus,
  MilestoneStatus,
  QuestionStatus,
  PhaseWithMilestones,
  ProjectWithProgress,
} from "./projects";
export type {
  Proposal,
  ProposalLineItem,
  ProposalStatus,
  PricingType,
  ProposalWithItems,
} from "./proposals";
export type {
  Invoice,
  InvoiceLineItem,
  Payment,
  InvoiceStatus,
  PaymentMethod,
} from "./invoices";
export type {
  Notification,
  NotificationType,
  NotificationChannel,
} from "./notifications";
export type {
  CalendarEvent,
  BookingSetting,
  EventType,
  Attendee,
  CalendarEventWithRelations,
} from "./calendar";
export type { ActivityLogEntry, AuditLogEntry } from "./activity";
export type {
  Article,
  ArticleStatus,
  ArticleFilters,
  ArticleWithAuthor,
} from "./news";
export type { AuthErrorCode, AuthError, AuthResult } from "./auth";
export {
  DEFAULT_PROJECT_PHASES,
  DEFAULT_PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
  DEFAULT_TERMS,
} from "./constants";
