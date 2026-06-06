// SPEC: SPEC-DATA-MODEL.md — All tables, enums, indexes
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  jsonb,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ============================================
// ENUMS
// ============================================

export const leadSourceEnum = pgEnum("lead_source", [
  "web_form",
  "referral",
  "vapi",
  "cold_outreach",
  "word_of_mouth",
  "other",
]);

export const leadScoreEnum = pgEnum("lead_score", [
  "high",
  "medium",
  "low",
]);

export const pipelineStageEnum = pgEnum("pipeline_stage", [
  "new_lead",
  "contacted",
  "discovery_scheduled",
  "discovery_completed",
  "proposal_sent",
  "negotiation",
  "contract_signed",
  "active_client",
  "project_delivered",
  "retention",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "in_progress",
  "paused",
  "completed",
  "cancelled",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "in_progress",
  "completed",
  "overdue",
]);

export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "viewed",
  "paid",
  "overdue",
  "cancelled",
]);

export const pricingTypeEnum = pgEnum("pricing_type", [
  "fixed",
  "phased",
  "hourly",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "square_invoice",
  "square_checkout",
  "manual",
  "other",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "sms",
  "in_app",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "lead_new",
  "lead_stage_change",
  "proposal_accepted",
  "payment_received",
  "client_question",
  "milestone_overdue",
  "lead_stale",
  "demo_shared",
  "milestone_completed",
  "meeting_booked",
]);


export const teamRoleEnum = pgEnum("team_role", ["admin", "member"]);

export const questionStatusEnum = pgEnum("question_status", [
  "pending",
  "replied",
]);

// ============================================
// TABLES
// ============================================

export const teamUsers = pgTable(
  "team_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    role: teamRoleEnum("role").notNull().default("member"),
    avatarUrl: text("avatar_url"),
    isActive: boolean("is_active").notNull().default(true),
    googleRefreshToken: text("google_refresh_token"),
    googleCalendarConnected: boolean("google_calendar_connected")
      .notNull()
      .default(false),
    googleCalendarEmail: text("google_calendar_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("team_users_email_idx").on(table.email)]
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    company: text("company"),
    phone: text("phone"),
    notes: text("notes"),
    authUserId: uuid("auth_user_id"),
    createdBy: uuid("created_by").references(() => teamUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("clients_email_idx").on(table.email),
    index("clients_auth_user_id_idx").on(table.authUserId),
  ]
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    companyName: text("company_name"),
    projectType: text("project_type"),
    projectTimeline: text("project_timeline"),
    existingSystems: text("existing_systems"),
    referralSource: text("referral_source"),
    preferredContact: text("preferred_contact").notNull().default("email"),
    projectDetails: text("project_details"),
    smsConsent: boolean("sms_consent").notNull().default(false),
    smsConsentTimestamp: timestamp("sms_consent_timestamp", {
      withTimezone: true,
    }),
    smsConsentIp: text("sms_consent_ip"),
    smsOptedOut: boolean("sms_opted_out").notNull().default(false),
    source: leadSourceEnum("source").notNull().default("web_form"),
    score: leadScoreEnum("score"),
    pipelineStage: pipelineStageEnum("pipeline_stage")
      .notNull()
      .default("new_lead"),
    pipelineStageChangedAt: timestamp("pipeline_stage_changed_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    aiInternalAnalysis: jsonb("ai_internal_analysis"),
    aiProspectSummary: text("ai_prospect_summary"),
    referredBy: uuid("referred_by").references(() => referrers.id),
    referralEmailSent: boolean("referral_email_sent")
      .notNull()
      .default(false),
    referralEmailSentAt: timestamp("referral_email_sent_at", {
      withTimezone: true,
    }),
    convertedToClientId: uuid("converted_to_client_id").references(
      () => clients.id
    ),
    assignedTo: uuid("assigned_to").references(() => teamUsers.id),
    notes: text("notes"),
    lastContactedAt: timestamp("last_contacted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("leads_pipeline_stage_idx").on(table.pipelineStage),
    index("leads_source_idx").on(table.source),
    index("leads_score_idx").on(table.score),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_assigned_to_idx").on(table.assignedTo),
    index("leads_last_contacted_at_idx").on(table.lastContactedAt),
    index("leads_converted_to_client_id_idx").on(table.convertedToClientId),
  ]
);

export const referrers = pgTable(
  "referrers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    feedback: text("feedback"),
    aiFeedbackAnalysis: jsonb("ai_feedback_analysis"),
    totalReferrals: integer("total_referrals").notNull().default(0),
    fromParam: text("from_param"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("referrers_slug_idx").on(table.slug),
    uniqueIndex("referrers_email_idx").on(table.email),
  ]
);

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id),
    clientId: uuid("client_id").references(() => clients.id),
    type: text("type").notNull(),
    subject: text("subject"),
    body: text("body"),
    direction: text("direction").notNull().default("outbound"),
    createdBy: uuid("created_by").references(() => teamUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("contacts_lead_id_idx").on(table.leadId),
    index("contacts_client_id_idx").on(table.clientId),
    index("contacts_created_at_idx").on(table.createdAt),
  ]
);

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id),
    clientId: uuid("client_id").references(() => clients.id),
    projectId: uuid("project_id"),
    title: text("title").notNull(),
    scopeOfWork: text("scope_of_work").notNull(),
    deliverables: text("deliverables").notNull(),
    termsAndConditions: text("terms_and_conditions").notNull(),
    pricingType: pricingTypeEnum("pricing_type").notNull().default("fixed"),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    status: proposalStatusEnum("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    declinedAt: timestamp("declined_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    clientSignature: text("client_signature"),
    aiGenerated: boolean("ai_generated").notNull().default(false),
    aiPromptContext: text("ai_prompt_context"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => teamUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("proposals_lead_id_idx").on(table.leadId),
    index("proposals_client_id_idx").on(table.clientId),
    index("proposals_project_id_idx").on(table.projectId),
    index("proposals_status_idx").on(table.status),
    index("proposals_created_at_idx").on(table.createdAt),
  ]
);

export const proposalLineItems = pgTable(
  "proposal_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 })
      .notNull()
      .default("1"),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    total: decimal("total", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    sortOrder: integer("sort_order").notNull().default(0),
    phaseLabel: text("phase_label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("proposal_line_items_proposal_id_idx").on(table.proposalId),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    proposalId: uuid("proposal_id").references(() => proposals.id),
    leadId: uuid("lead_id").references(() => leads.id),
    projectType: text("project_type"),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("draft"),
    pricingType: pricingTypeEnum("pricing_type").notNull().default("fixed"),
    totalValue: decimal("total_value", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    startDate: date("start_date"),
    targetEndDate: date("target_end_date"),
    actualEndDate: date("actual_end_date"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => teamUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("projects_client_id_idx").on(table.clientId),
    index("projects_status_idx").on(table.status),
    index("projects_created_at_idx").on(table.createdAt),
  ]
);

export const projectPhases = pgTable(
  "project_phases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("project_phases_project_id_sort_idx").on(
      table.projectId,
      table.sortOrder
    ),
  ]
);

export const projectMilestones = pgTable(
  "project_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    phaseId: uuid("phase_id")
      .notNull()
      .references(() => projectPhases.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: milestoneStatusEnum("status").notNull().default("pending"),
    sortOrder: integer("sort_order").notNull().default(0),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    triggersInvoice: boolean("triggers_invoice").notNull().default(false),
    invoiceAmount: decimal("invoice_amount", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("project_milestones_project_id_idx").on(table.projectId),
    index("project_milestones_phase_id_idx").on(table.phaseId),
    index("project_milestones_status_idx").on(table.status),
    index("project_milestones_due_date_idx").on(table.dueDate),
  ]
);

export const projectRepos = pgTable(
  "project_repos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    githubOwner: text("github_owner").notNull(),
    githubRepo: text("github_repo").notNull(),
    githubUrl: text("github_url").notNull(),
    defaultBranch: text("default_branch").notNull().default("main"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("project_repos_project_id_idx").on(table.projectId),
    uniqueIndex("project_repos_unique_idx").on(
      table.projectId,
      table.githubOwner,
      table.githubRepo
    ),
  ]
);

export const projectDemos = pgTable(
  "project_demos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    phaseId: uuid("phase_id").references(() => projectPhases.id),
    isAutoPulled: boolean("is_auto_pulled").notNull().default(false),
    isApproved: boolean("is_approved").notNull().default(false),
    createdBy: uuid("created_by").references(() => teamUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("project_demos_project_id_idx").on(table.projectId),
    index("project_demos_is_approved_idx").on(table.isApproved),
  ]
);

export const projectQuestions = pgTable(
  "project_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    questionText: text("question_text").notNull(),
    status: questionStatusEnum("status").notNull().default("pending"),
    replyDraft: text("reply_draft"),
    replyText: text("reply_text"),
    repliedBy: uuid("replied_by").references(() => teamUsers.id),
    repliedAt: timestamp("replied_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("project_questions_project_id_idx").on(table.projectId),
    index("project_questions_client_id_idx").on(table.clientId),
    index("project_questions_status_idx").on(table.status),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    projectId: uuid("project_id").references(() => projects.id),
    milestoneId: uuid("milestone_id").references(
      () => projectMilestones.id
    ),
    squareInvoiceId: text("square_invoice_id"),
    squarePaymentUrl: text("square_payment_url"),
    title: text("title").notNull(),
    description: text("description"),
    amount: decimal("amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    viewedAt: timestamp("viewed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    dueDate: date("due_date"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => teamUsers.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("invoices_client_id_idx").on(table.clientId),
    index("invoices_project_id_idx").on(table.projectId),
    index("invoices_status_idx").on(table.status),
    index("invoices_square_invoice_id_idx").on(table.squareInvoiceId),
  ]
);

export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 })
      .notNull()
      .default("1"),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    total: decimal("total", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("invoice_line_items_invoice_id_idx").on(table.invoiceId),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    squarePaymentId: text("square_payment_id"),
    amount: decimal("amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    method: paymentMethodEnum("method")
      .notNull()
      .default("square_invoice"),
    paidAt: timestamp("paid_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("payments_invoice_id_idx").on(table.invoiceId),
    index("payments_client_id_idx").on(table.clientId),
    index("payments_square_payment_id_idx").on(table.squarePaymentId),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: notificationTypeEnum("type").notNull(),
    channel: notificationChannelEnum("channel").notNull().default("email"),
    recipientEmail: text("recipient_email").notNull(),
    recipientPhone: text("recipient_phone"),
    subject: text("subject"),
    body: text("body").notNull(),
    relatedLeadId: uuid("related_lead_id").references(() => leads.id),
    relatedProjectId: uuid("related_project_id").references(
      () => projects.id
    ),
    relatedInvoiceId: uuid("related_invoice_id").references(
      () => invoices.id
    ),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("notifications_type_idx").on(table.type),
    index("notifications_created_at_idx").on(table.createdAt),
    index("notifications_related_lead_id_idx").on(table.relatedLeadId),
    index("notifications_related_project_id_idx").on(
      table.relatedProjectId
    ),
  ]
);

export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => teamUsers.id),
    actorType: text("actor_type").notNull().default("team"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("activity_log_actor_id_idx").on(table.actorId),
    index("activity_log_action_idx").on(table.action),
    index("activity_log_entity_idx").on(table.entityType, table.entityId),
    index("activity_log_created_at_idx").on(table.createdAt),
  ]
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => teamUsers.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_log_actor_id_idx").on(table.actorId),
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
    index("audit_log_created_at_idx").on(table.createdAt),
  ]
);

export const systemSettings = pgTable(
  "system_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    updatedBy: uuid("updated_by").references(() => teamUsers.id),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("system_settings_key_idx").on(table.key)]
);

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    googleEventId: text("google_event_id"),
    title: text("title").notNull(),
    description: text("description"),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    location: text("location"),
    meetingLink: text("meeting_link"),
    attendees: jsonb("attendees"),
    eventType: text("event_type").notNull().default("other"),
    relatedLeadId: uuid("related_lead_id").references(() => leads.id),
    relatedProjectId: uuid("related_project_id").references(
      () => projects.id
    ),
    relatedClientId: uuid("related_client_id").references(() => clients.id),
    bookedByName: text("booked_by_name"),
    bookedByEmail: text("booked_by_email"),
    bookedByPhone: text("booked_by_phone"),
    bookedByCompany: text("booked_by_company"),
    reminder24hSent: boolean("reminder_24h_sent").notNull().default(false),
    reminder4hSent: boolean("reminder_4h_sent").notNull().default(false),
    contactLoggedAt: timestamp("contact_logged_at", { withTimezone: true }),
    followUpSentAt: timestamp("follow_up_sent_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => teamUsers.id),
    googleCalendarId: text("google_calendar_id"),
    googleHtmlLink: text("google_html_link"),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("calendar_events_start_time_idx").on(table.startTime),
    index("calendar_events_google_event_id_idx").on(table.googleEventId),
    index("calendar_events_lead_id_idx").on(table.relatedLeadId),
    index("calendar_events_client_id_idx").on(table.relatedClientId),
    index("calendar_events_project_id_idx").on(table.relatedProjectId),
    index("calendar_events_booked_by_email_idx").on(table.bookedByEmail),
  ]
);

export const bookingSettings = pgTable("booking_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  slotDurationMinutes: integer("slot_duration_minutes")
    .notNull()
    .default(30),
  availableDays: jsonb("available_days").notNull().default([1, 2, 3, 4, 5]),
  availableStartTime: text("available_start_time")
    .notNull()
    .default("09:00"),
  availableEndTime: text("available_end_time").notNull().default("17:00"),
  timezone: text("timezone").notNull().default("America/Chicago"),
  bufferMinutes: integer("buffer_minutes").notNull().default(15),
  maxAdvanceDays: integer("max_advance_days").notNull().default(30),
  teamEmails: jsonb("team_emails")
    .notNull()
    .default([
      "jay@m.botmakers.ai",
      "dessiah@m.botmakers.ai",
      "trent@botmakers.ai",
    ]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
