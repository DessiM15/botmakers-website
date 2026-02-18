import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { LeadFormData, LeadRecord } from "./types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  _client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}

export async function insertLead(
  data: LeadFormData & { smsConsentIp: string }
): Promise<LeadRecord> {
  const client = getClient();

  const record = {
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    company_name: data.companyName,
    project_type: data.projectType,
    project_timeline: data.projectTimeline,
    project_details: data.projectDetails,
    sms_consent: data.smsConsent,
    sms_consent_timestamp: data.smsConsent ? new Date().toISOString() : null,
    sms_consent_ip: data.smsConsentIp,
    score: "medium",
    source: "web_form",
  };

  if (client) {
    const { data: row, error } = await client
      .from("leads")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Insert lead error:", error);
      throw new Error("Failed to store lead");
    }

    return mapRowToLeadRecord(row);
  }

  // Fallback: in-memory for development without Supabase
  const fallback: LeadRecord = {
    ...data,
    id: crypto.randomUUID(),
    leadScore: "Medium",
    aiInternalAnalysis: null,
    aiProspectSummary: null,
    status: "pending",
    smsOptedOut: false,
    smsConsentTimestamp: data.smsConsent ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  console.log("[Lead Stored (in-memory)]", fallback.id, fallback.fullName);
  return fallback;
}

export async function updateLead(
  id: string,
  updates: Partial<LeadRecord>
): Promise<LeadRecord | null> {
  const client = getClient();

  if (client) {
    // Map camelCase fields to snake_case for DB
    const dbUpdates: Record<string, unknown> = {};
    if (updates.leadScore !== undefined) dbUpdates.score = updates.leadScore.toLowerCase();
    if (updates.aiInternalAnalysis !== undefined)
      dbUpdates.ai_internal_analysis = updates.aiInternalAnalysis;
    if (updates.aiProspectSummary !== undefined)
      dbUpdates.ai_prospect_summary = updates.aiProspectSummary;
    if (updates.smsOptedOut !== undefined) dbUpdates.sms_opted_out = updates.smsOptedOut;

    const { data: row, error } = await client
      .from("leads")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Update lead error:", error);
      return null;
    }

    return mapRowToLeadRecord(row);
  }

  // Fallback: no-op in dev
  console.log("[Lead Updated (no-op)]", id);
  return null;
}

export async function getLeadById(id: string): Promise<LeadRecord | null> {
  const client = getClient();

  if (client) {
    const { data: row, error } = await client
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !row) return null;
    return mapRowToLeadRecord(row);
  }

  return null;
}

// Map snake_case DB row to camelCase LeadRecord
function mapRowToLeadRecord(row: Record<string, unknown>): LeadRecord {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: row.phone as string,
    companyName: (row.company_name as string) || "",
    projectType: (row.project_type as string) || "",
    projectTimeline: (row.project_timeline as string) || "",
    projectDetails: (row.project_details as string) || "",
    smsConsent: (row.sms_consent as boolean) || false,
    smsConsentTimestamp: (row.sms_consent_timestamp as string) || undefined,
    smsConsentIp: (row.sms_consent_ip as string) || undefined,
    leadScore: ((row.score as string) || "medium").replace(/^\w/, (c: string) => c.toUpperCase()) as "High" | "Medium" | "Low",
    aiInternalAnalysis: (row.ai_internal_analysis as LeadRecord["aiInternalAnalysis"]) || null,
    aiProspectSummary: (row.ai_prospect_summary as string) || null,
    status: (row.pipeline_stage === "new_lead" ? "pending" : "processed") as LeadRecord["status"],
    smsOptedOut: (row.sms_opted_out as boolean) || false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
