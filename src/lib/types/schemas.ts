// SPEC: All Zod validation schemas for forms and API input
import { z } from "zod";

// Phone — accept any reasonable phone string (7-20 chars) or empty/undefined
const phoneField = z
  .string()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .optional()
  .or(z.literal(""));

export const leadFormSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: phoneField,
  company_name: z.string().optional(),
  project_type: z.string().min(1, "Please select a project type"),
  project_timeline: z.string().min(1, "Please select a timeline"),
  existing_systems: z.string().optional(),
  referral_source: z.string().optional(),
  preferred_contact: z.string().default("email"),
  project_details: z
    .string()
    .min(50, "Please provide at least 50 characters about your project"),
  sms_consent: z.boolean().default(false),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const teamLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type TeamLoginInput = z.infer<typeof teamLoginSchema>;

export const projectCreateSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client_id: z.string().uuid("Invalid client ID"),
  project_type: z.string().optional(),
  description: z.string().optional(),
  pricing_type: z.enum(["fixed", "phased", "hourly"]).default("fixed"),
  total_value: z
    .number()
    .min(0, "Value cannot be negative")
    .default(0),
  start_date: z.string().optional(),
  target_end_date: z.string().optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

export const proposalCreateSchema = z.object({
  title: z.string().min(1, "Proposal title is required"),
  lead_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid().optional().nullable(),
  scope_of_work: z.string().min(1, "Scope of work is required"),
  deliverables: z.string().min(1, "Deliverables are required"),
  terms_and_conditions: z.string().min(1, "Terms are required"),
  pricing_type: z.enum(["fixed", "phased", "hourly"]).default("fixed"),
  line_items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(0).default(1),
        unit_price: z.number().min(0).default(0),
        phase_label: z.string().optional().nullable(),
        sort_order: z.number().default(0),
      })
    )
    .min(1, "At least one line item is required"),
  expires_at: z.string().optional().nullable(),
  ai_prompt_context: z.string().optional().nullable(),
});

export type ProposalCreateInput = z.infer<typeof proposalCreateSchema>;

export const invoiceCreateSchema = z.object({
  client_id: z.string().uuid("Invalid client ID"),
  project_id: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Invoice title is required"),
  description: z.string().optional(),
  line_items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(0).default(1),
        unit_price: z.number().min(0).default(0),
        sort_order: z.number().default(0),
      })
    )
    .min(1, "At least one line item is required"),
  due_date: z.string().min(1, "Due date is required"),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;

export const milestoneUpdateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]),
  due_date: z.string().optional().nullable(),
  triggers_invoice: z.boolean().default(false),
  invoice_amount: z.number().min(0).optional().nullable(),
});

export type MilestoneUpdateInput = z.infer<typeof milestoneUpdateSchema>;

export const questionSubmitSchema = z.object({
  question_text: z
    .string()
    .min(10, "Question must be at least 10 characters"),
});

export type QuestionSubmitInput = z.infer<typeof questionSubmitSchema>;

export const repoLinkSchema = z.object({
  github_owner: z.string().min(1, "GitHub owner is required"),
  github_repo: z.string().min(1, "Repository name is required"),
});

export type RepoLinkInput = z.infer<typeof repoLinkSchema>;

export const contactLogSchema = z.object({
  type: z.enum(["email", "phone", "sms", "meeting", "note"]),
  subject: z.string().optional(),
  body: z.string().optional(),
  direction: z.enum(["inbound", "outbound"]).default("outbound"),
});

export type ContactLogInput = z.infer<typeof contactLogSchema>;

// Calendar event creation
export const calendarEventCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  event_type: z
    .enum([
      "discovery_call",
      "client_meeting",
      "internal",
      "follow_up",
      "demo_booking",
      "other",
    ])
    .default("other"),
  attendees: z
    .array(z.object({ name: z.string(), email: z.string().email() }))
    .default([]),
  add_meet_link: z.boolean().default(true),
  related_lead_id: z.string().uuid().optional().nullable(),
  related_client_id: z.string().uuid().optional().nullable(),
  related_project_id: z.string().uuid().optional().nullable(),
  location: z.string().optional(),
});

export type CalendarEventCreateInput = z.infer<
  typeof calendarEventCreateSchema
>;

// Public booking form
export const publicBookingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Time is required"),
  message: z.string().optional(),
  timezone: z.string().default("America/Chicago"),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

// Booking settings
export const bookingSettingsSchema = z.object({
  slot_duration_minutes: z.number().min(15).max(120).default(30),
  available_days: z
    .array(z.number().min(0).max(6))
    .default([1, 2, 3, 4, 5]),
  available_start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default("09:00"),
  available_end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default("17:00"),
  timezone: z.string().default("America/Chicago"),
  buffer_minutes: z.number().min(0).max(60).default(15),
  max_advance_days: z.number().min(1).max(90).default(30),
  team_emails: z.array(z.string().email()).default([]),
});

export type BookingSettingsInput = z.infer<typeof bookingSettingsSchema>;

export const portalLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export type PortalLoginInput = z.infer<typeof portalLoginSchema>;

export const referralContactSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: phoneField,
  company_name: z.string().optional(),
  notes: z.string().optional(),
});

export type ReferralContactInput = z.infer<typeof referralContactSchema>;

export const referralFormSchema = z.object({
  referrer_name: z
    .string()
    .min(2, "Your name must be at least 2 characters")
    .max(100),
  referrer_email: z.string().email("Please enter a valid email"),
  referrer_company: z.string().optional(),
  feedback: z.string().optional(),
  contacts: z
    .array(referralContactSchema)
    .min(1, "Please refer at least one contact")
    .max(5, "Maximum 5 contacts per submission"),
});

export type ReferralFormInput = z.infer<typeof referralFormSchema>;

// Article schemas
export const articleCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z.string().optional(),
  excerpt: z.string().max(500, "Excerpt too long").optional(),
  content: z.string().optional(),
  featured_image_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived", "scheduled"]).default("draft"),
  scheduled_at: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().max(70, "Meta title too long").optional(),
  meta_description: z.string().max(160, "Meta description too long").optional(),
});

export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;

export const articleUpdateSchema = articleCreateSchema.partial();

export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
