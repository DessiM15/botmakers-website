import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ referrers: [] });
  }

  const { data: referrers, error } = await supabaseAdmin
    .from("referrers")
    .select("*, referrals(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin Referrals] Error:", error);
    return NextResponse.json({ referrers: [] });
  }

  const mapped = (referrers || []).map((r) => ({
    id: r.id,
    full_name: r.full_name,
    email: r.email,
    company: r.company,
    feedback: r.feedback,
    total_referrals: (r.referrals || []).length,
    created_at: r.created_at,
    referrals: (r.referrals || []).map(
      (ref: { name: string; email: string; phone: string; company: string; status: string }) => ({
        name: ref.name,
        email: ref.email,
        phone: ref.phone,
        company: ref.company,
        status: ref.status,
      })
    ),
  }));

  return NextResponse.json({ referrers: mapped });
}
