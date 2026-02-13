import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const { questionId } = await params;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();

  const { data: question, error } = await supabaseAdmin
    .from("project_questions")
    .update({
      reply_text: body.reply_text,
      replied_at: new Date().toISOString(),
    })
    .eq("id", questionId)
    .select()
    .single();

  if (error) {
    console.error("[Question Reply] Error:", error);
    return NextResponse.json({ error: "Failed to save reply" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    question: {
      id: question.id,
      reply_text: question.reply_text,
      replied_by: question.replied_by,
      replied_at: question.replied_at,
    },
  });
}
