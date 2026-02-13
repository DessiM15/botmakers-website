import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_PROJECT_PHASES } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();

  // Create the project
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .insert({
      name: body.client_company
        ? `${body.client_company} Project`
        : `${body.client_name} Project`,
      client_name: body.client_name,
      client_email: body.client_email,
      client_company: body.client_company || null,
      client_phone: body.client_phone || null,
      project_type: body.project_type || null,
      status: "draft",
      linked_lead_id: id,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("[Convert Lead] Project creation error:", projectError);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }

  // Create default phases and milestones
  for (const phaseTemplate of DEFAULT_PROJECT_PHASES) {
    const { data: phase, error: phaseError } = await supabaseAdmin
      .from("project_phases")
      .insert({
        project_id: project.id,
        name: phaseTemplate.name,
        sort_order: phaseTemplate.sort_order,
      })
      .select("id")
      .single();

    if (phaseError || !phase) continue;

    const milestones = phaseTemplate.milestones.map((title, idx) => ({
      phase_id: phase.id,
      project_id: project.id,
      title,
      status: "pending",
      sort_order: idx + 1,
    }));

    await supabaseAdmin.from("project_milestones").insert(milestones);
  }

  // Update lead status to converted
  await supabaseAdmin.from("leads").update({ status: "converted" }).eq("id", id);

  return NextResponse.json({ success: true, projectId: project.id });
}
