import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Get project
    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", id)
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

    // Sort milestones within each phase
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

    // Get questions
    const { data: questions } = await supabaseAdmin
      .from("project_questions")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      ...project,
      phases: sortedPhases,
      demos: demos || [],
      questions: questions || [],
    });
  } catch (err) {
    console.error("[Admin Project GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
  if (body.name !== undefined) updates.name = body.name;
  if (body.status !== undefined) updates.status = body.status;
  if (body.description !== undefined) updates.description = body.description;
  if (body.client_name !== undefined) updates.client_name = body.client_name;
  if (body.client_email !== undefined) updates.client_email = body.client_email;
  if (body.client_company !== undefined) updates.client_company = body.client_company;
  if (body.client_phone !== undefined) updates.client_phone = body.client_phone;
  if (body.project_type !== undefined) updates.project_type = body.project_type;

  const { error } = await supabaseAdmin
    .from("projects")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("[Admin Project PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
