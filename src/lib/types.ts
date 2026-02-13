export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectType: string;
  projectTimeline: string;
  projectDetails: string;
  smsConsent: boolean;
  smsConsentTimestamp?: string;
  smsConsentIp?: string;
}

export interface LeadRecord extends LeadFormData {
  id: string;
  leadScore: "High" | "Medium" | "Low";
  aiInternalAnalysis: AIInternalAnalysis | null;
  aiProspectSummary: string | null;
  status: "pending" | "processed" | "reviewed" | "contacted" | "closed";
  smsOptedOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIInternalAnalysis {
  leadScore: "High" | "Medium" | "Low";
  projectSummary: string;
  complexityAssessment: {
    level: "Simple" | "Moderate" | "Complex";
    reasoning: string;
  };
  estimatedEffort: string;
  keyQuestions: string[];
  redFlags: string[];
  recommendedNextStep: string;
}

export interface AIProspectOutput {
  projectUnderstanding: string;
  recommendedPath: { phase: string; description: string }[];
  whatHappensNext: string;
}

export interface AIAnalysisResult {
  internal: AIInternalAnalysis;
  prospect: AIProspectOutput;
}

export const PROJECT_TYPES = [
  "Custom AI Software",
  "Systems Integration",
  "AI Strategy & Consulting",
  "Data Engineering",
  "ML Solutions",
  "AI Analytics & Insights",
  "Enterprise Security AI",
  "Process Automation",
  "Other",
] as const;

export const PROJECT_TIMELINES = [
  "ASAP / Urgent",
  "1–3 Months",
  "3–6 Months",
  "6+ Months",
  "Just Exploring / No Timeline",
] as const;

export const INTERNAL_TEAM = {
  jay: "jay@m.botmakers.ai",
  trent: "tdaniel@botmakers.ai",
  dee: "dessiah@m.botmakers.ai",
} as const;

// ============================================
// Referral System Types
// ============================================

export interface ReferralSlot {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface ReferralFormData {
  referrerName: string;
  referrerEmail: string;
  referrerCompany: string;
  industryFeedback: string;
  referrals: ReferralSlot[];
}

export interface ReferralSubmission extends ReferralFormData {
  id: string;
  referralCount: number;
  submittedAt: string;
  ip: string;
}

export const EMPTY_REFERRAL_SLOT: ReferralSlot = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

export const MAX_REFERRAL_SLOTS = 5;

// ============================================
// Admin Dashboard & Client Portal Types
// ============================================

export type LeadStatus =
  | "pending"
  | "processed"
  | "reviewed"
  | "contacted"
  | "qualified"
  | "converted"
  | "closed";

export type LeadSource = "web_form" | "referral" | "vapi";

export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  client_name: string;
  client_email: string;
  client_company: string | null;
  client_phone: string | null;
  project_type: string;
  description: string | null;
  status: ProjectStatus;
  linked_lead_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields (from joins)
  progress?: number;
  current_phase?: string;
  phases?: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  milestones?: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  phase_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

export interface ProjectDemo {
  id: string;
  project_id: string;
  title: string;
  url: string;
  description: string | null;
  phase_id: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ProjectQuestion {
  id: string;
  project_id: string;
  client_email: string;
  question_text: string;
  reply_text: string | null;
  reply_draft: string | null;
  replied_by: string | null;
  replied_at: string | null;
  created_at: string;
}

export const DEFAULT_PROJECT_PHASES = [
  {
    name: "Discovery",
    sort_order: 1,
    milestones: [
      "Initial consultation completed",
      "Requirements documented",
      "Project plan approved",
    ],
  },
  {
    name: "MVP Build",
    sort_order: 2,
    milestones: [
      "Development environment setup",
      "Core features implemented",
      "Internal testing passed",
    ],
  },
  {
    name: "Revision",
    sort_order: 3,
    milestones: [
      "Client feedback collected",
      "Revisions implemented",
      "Final testing passed",
    ],
  },
  {
    name: "Launch",
    sort_order: 4,
    milestones: [
      "Deployment completed",
      "Client training done",
      "Project handoff complete",
    ],
  },
] as const;

export interface DashboardMetrics {
  leadsThisWeek: number;
  leadsLastWeek: number;
  leadsThisMonth: number;
  sourceBreakdown: { web_form: number; referral: number; vapi: number };
  activeProjects: number;
  projectsByPhase: Record<string, number>;
}

export interface ActivityItem {
  id: string;
  type: "lead" | "referral" | "project" | "question";
  description: string;
  link: string;
  created_at: string;
}
