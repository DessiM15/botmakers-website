import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

// POST: Add a milestone to this phase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const { id, phaseId } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();

  const { data: milestone, error } = await supabaseAdmin
    .from("project_milestones")
    .insert({
      phase_id: phaseId,
      project_id: id,
      title: body.title,
      status: "pending",
      sort_order: body.sort_order || 1,
    })
    .select()
    .single();

  if (error || !milestone) {
    console.error("[Phase POST Milestone] Error:", error);
    return NextResponse.json({ error: "Failed to add milestone" }, { status: 500 });
  }

  return NextResponse.json({ success: true, milestone });
}

// DELETE: Delete an entire phase (cascades to milestones)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; phaseId: string }> }
) {
  const { phaseId } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { error } = await supabaseAdmin
    .from("project_phases")
    .delete()
    .eq("id", phaseId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete phase" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
