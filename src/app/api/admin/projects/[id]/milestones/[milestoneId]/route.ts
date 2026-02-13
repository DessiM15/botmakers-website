import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { milestoneId } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.status !== undefined) {
    updates.status = body.status;
    updates.completed_at = body.status === "completed" ? new Date().toISOString() : null;
  }
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  const { error } = await supabaseAdmin
    .from("project_milestones")
    .update(updates)
    .eq("id", milestoneId);

  if (error) {
    console.error("[Milestone PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }

  return NextResponse.json({ success: true, milestoneId, ...updates });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  const { milestoneId } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { error } = await supabaseAdmin
    .from("project_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
