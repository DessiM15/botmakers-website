import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getClientUser } from "@/lib/auth";
import { sendClientQuestionNotificationEmail } from "@/lib/project-emails";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const client = await getClientUser(request);
    if (!client) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question_text } = await request.json();

    if (!question_text?.trim()) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      );
    }

    // Verify project belongs to client
    const { data: project } = await supabaseAdmin
      .from("projects")
      .select("id, name, client_name, client_email, client_company")
      .eq("id", id)
      .eq("client_email", client.email)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Insert question
    const { data: question, error } = await supabaseAdmin
      .from("project_questions")
      .insert({
        project_id: id,
        client_email: client.email,
        question_text: question_text.trim(),
      })
      .select("id")
      .single();

    if (error || !question) {
      console.error("[Portal Question] Insert error:", error);
      return NextResponse.json({ error: "Failed to submit question" }, { status: 500 });
    }

    // Notify team
    await sendClientQuestionNotificationEmail(
      project as { id: string; name: string; client_name: string },
      question_text.trim()
    ).catch((err) => console.error("[Portal Question] Email error:", err));

    return NextResponse.json({ success: true, id: question.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit question" },
      { status: 500 }
    );
  }
}
