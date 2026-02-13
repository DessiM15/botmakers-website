import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getClientUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const client = await getClientUser(request);
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get project — verify client email matches
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("client_email", client.email)
    .single();

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Get phases with milestones
  const { data: phases } = await supabaseAdmin
    .from("project_phases")
    .select("*, project_milestones(*)")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const sortedPhases = (phases || []).map((phase) => ({
    ...phase,
    milestones: ((phase.project_milestones || []) as Record<string, unknown>[])
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((m) => ({
        id: m.id,
        phase_id: m.phase_id,
        project_id: m.project_id,
        title: m.title,
        description: m.description,
        status: m.status,
        sort_order: m.sort_order,
        completed_at: m.completed_at,
        created_at: m.created_at,
      })),
    project_milestones: undefined,
  }));

  // Get demos
  const { data: demos } = await supabaseAdmin
    .from("project_demos")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Get questions for this client
  const { data: questions } = await supabaseAdmin
    .from("project_questions")
    .select("*")
    .eq("project_id", id)
    .eq("client_email", client.email)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    ...project,
    phases: sortedPhases,
    demos: demos || [],
    questions: questions || [],
  });
}
