import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; demoId: string }> }
) {
  const { demoId } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { error } = await supabaseAdmin
    .from("project_demos")
    .delete()
    .eq("id", demoId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete demo" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
