import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { data: row, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    company_name: row.company_name,
    project_type: row.project_type,
    project_timeline: row.project_timeline,
    existing_systems: row.existing_systems,
    referral_source: row.referral_source,
    preferred_contact: row.preferred_contact,
    project_details: row.project_details,
    sms_consent: row.sms_consent,
    lead_score: row.lead_score,
    status: row.status,
    source: row.source,
    ai_internal_analysis: row.ai_internal_analysis,
    ai_prospect_summary: row.ai_prospect_summary,
    notes: row.notes || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) updates.status = body.status;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.lead_score !== undefined) updates.lead_score = body.lead_score;

  const { error } = await supabaseAdmin
    .from("leads")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[Admin Lead PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
