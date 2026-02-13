import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getClientUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ projects: [] });
  }

  const client = await getClientUser(request);
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*, project_milestones(id, status)")
    .eq("client_email", client.email)
    .in("status", ["draft", "in_progress", "paused", "completed"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Portal Projects] Error:", error);
    return NextResponse.json({ projects: [] });
  }

  const mapped = (projects || []).map((p) => {
    const milestones = (p.project_milestones || []) as { id: string; status: string }[];
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: p.id,
      name: p.name,
      client_name: p.client_name,
      client_email: p.client_email,
      client_company: p.client_company,
      project_type: p.project_type,
      status: p.status,
      progress,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });

  return NextResponse.json({ projects: mapped });
}
