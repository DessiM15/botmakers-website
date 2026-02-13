import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ leads: [], total: 0, page: 1, per_page: 20 });
  }

  const params = request.nextUrl.searchParams;
  const page = parseInt(params.get("page") || "1");
  const limit = parseInt(params.get("limit") || params.get("per_page") || "20");
  const search = params.get("search")?.toLowerCase() || "";
  const source = params.get("source") || "";
  const status = params.get("status") || "";
  const score = params.get("score") || "";

  let query = supabaseAdmin
    .from("leads")
    .select(
      "id, full_name, email, phone, company_name, source, status, lead_score, project_type, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (source) query = query.eq("source", source);
  if (status) query = query.eq("status", status);
  if (score) query = query.eq("lead_score", score);

  const start = (page - 1) * limit;
  query = query.range(start, start + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("[Admin Leads] Error:", error);
    return NextResponse.json({ leads: [], total: 0, page, per_page: limit });
  }

  const leads = (data || []).map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    company: row.company_name,
    source: row.source,
    status: row.status,
    lead_score: row.lead_score,
    project_type: row.project_type,
    created_at: row.created_at,
  }));

  return NextResponse.json({ leads, total: count || 0, page, per_page: limit });
}
