// SPEC: SPEC-DATA-MODEL.md > leads
import type { InferSelectModel } from "drizzle-orm";
import type { leads } from "@/lib/db/schema";

export type Lead = InferSelectModel<typeof leads>;

export type LeadSource =
  | "web_form"
  | "referral"
  | "vapi"
  | "cold_outreach"
  | "word_of_mouth"
  | "other";

export type LeadScore = "high" | "medium" | "low";

export type PipelineStage =
  | "new_lead"
  | "contacted"
  | "discovery_scheduled"
  | "discovery_completed"
  | "proposal_sent"
  | "negotiation"
  | "contract_signed"
  | "active_client"
  | "project_delivered"
  | "retention";

export interface LeadFilters {
  search?: string;
  source?: LeadSource;
  score?: LeadScore;
  stage?: PipelineStage;
  assignedTo?: string;
  page?: number;
  perPage?: number;
  sortBy?: keyof Lead;
  sortOrder?: "asc" | "desc";
}

export interface AIAnalysis {
  score: LeadScore;
  summary: string;
  complexity: "low" | "medium" | "high";
  redFlags: string[];
  estimatedValue: string;
  recommendedActions: string[];
}

export interface LeadWithAnalysis extends Lead {
  analysis: AIAnalysis | null;
}
