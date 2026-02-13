import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_PROJECT_PHASES } from "@/lib/types";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ projects: [] });
  }

  // Get projects with milestone counts for progress calculation
  const { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*, project_milestones(id, status), project_phases(id, name, sort_order)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin Projects] Error:", error);
    return NextResponse.json({ projects: [] });
  }

  const mapped = (projects || []).map((p) => {
    const milestones = (p.project_milestones || []) as { id: string; status: string }[];
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === "completed").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Find current phase (the one with an in_progress milestone, or the first with pending)
    const phases = (p.project_phases || []) as { id: string; name: string; sort_order: number }[];
    phases.sort((a, b) => a.sort_order - b.sort_order);
    const currentPhase = phases.find((ph) =>
      milestones.some((m) => m.status === "in_progress")
    )?.name || phases[0]?.name || "Discovery";

    return {
      id: p.id,
      name: p.name,
      client_name: p.client_name,
      client_email: p.client_email,
      client_company: p.client_company,
      client_phone: p.client_phone,
      project_type: p.project_type,
      description: p.description,
      status: p.status,
      linked_lead_id: p.linked_lead_id,
      created_by: p.created_by,
      progress,
      current_phase: currentPhase,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });

  return NextResponse.json({ projects: mapped });
}

export async function POST(request: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();

  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .insert({
      name: body.name,
      client_name: body.client_name,
      client_email: body.client_email,
      client_company: body.client_company || null,
      client_phone: body.client_phone || null,
      project_type: body.project_type || null,
      description: body.description || null,
      status: "draft",
      linked_lead_id: body.linked_lead_id || null,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("[Create Project] Error:", projectError);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  // Create default phases and milestones
  for (const phaseTemplate of DEFAULT_PROJECT_PHASES) {
    const { data: phase } = await supabaseAdmin
      .from("project_phases")
      .insert({
        project_id: project.id,
        name: phaseTemplate.name,
        sort_order: phaseTemplate.sort_order,
      })
      .select("id")
      .single();

    if (!phase) continue;

    const milestones = phaseTemplate.milestones.map((title, idx) => ({
      phase_id: phase.id,
      project_id: project.id,
      title,
      status: "pending",
      sort_order: idx + 1,
    }));

    await supabaseAdmin.from("project_milestones").insert(milestones);
  }

  return NextResponse.json({ id: project.id, ...body, status: "draft" });
}
