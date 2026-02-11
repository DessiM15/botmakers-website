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
