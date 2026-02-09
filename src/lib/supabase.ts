// Supabase client — placeholder until credentials are provided.
// Once SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env,
// uncomment the real client below and remove the mock.

// import { createClient } from "@supabase/supabase-js";
//
// export const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

import type { LeadFormData, LeadRecord } from "./types";

// In-memory store for development (replaced by Supabase in production)
const leads: LeadRecord[] = [];

export async function insertLead(
  data: LeadFormData & { smsConsentIp: string }
): Promise<LeadRecord> {
  const record: LeadRecord = {
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
  leads.push(record);
  console.log("[Lead Stored]", record.id, record.fullName);
  return record;
}

export async function updateLead(
  id: string,
  updates: Partial<LeadRecord>
): Promise<LeadRecord | null> {
  const index = leads.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leads[index] = { ...leads[index], ...updates, updatedAt: new Date().toISOString() };
  return leads[index];
}

export async function getLeadById(id: string): Promise<LeadRecord | null> {
  return leads.find((l) => l.id === id) ?? null;
}
