import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { question_text, draft_reply, project_id } = await request.json();

    if (!question_text || !draft_reply) {
      return NextResponse.json(
        { error: "Missing question_text or draft_reply" },
        { status: 400 }
      );
    }

    // If Anthropic API key is not configured, return the draft as-is
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log("[AI Polish] No API key, returning draft as-is");
      return NextResponse.json({ polished: draft_reply });
    }

    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      temperature: 0.5,
      system: `You are a professional communication assistant for Botmakers.ai, a custom AI software development company. Your job is to polish team draft replies to client questions.

Guidelines:
- Make the reply professional, warm, and confident
- Maintain the team's original meaning and intent
- Keep it concise — don't add unnecessary filler
- Use a helpful, reassuring tone
- Don't overpromise timelines or features
- Don't add greetings or sign-offs (those are handled separately)
- Return ONLY the polished reply text, nothing else`,
      messages: [
        {
          role: "user",
          content: `Client question: "${question_text}"

Team's draft reply: "${draft_reply}"

${project_id ? `Project ID: ${project_id}` : ""}

Please polish this reply to be professional and clear while keeping the same meaning.`,
        },
      ],
    });

    const polished =
      response.content[0].type === "text"
        ? response.content[0].text
        : draft_reply;

    return NextResponse.json({ polished });
  } catch (error) {
    console.error("AI polish error:", error);
    return NextResponse.json(
      { error: "Failed to polish reply", polished: "" },
      { status: 500 }
    );
  }
}
