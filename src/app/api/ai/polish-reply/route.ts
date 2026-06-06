// SPEC: SPEC-DEPENDENCY-MAP > AI Reply Polish > SERVER
// DEP-MAP: AI > POST /api/ai/polish-reply
import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
import { REPLY_POLISH_SYSTEM, buildReplyPolishPrompt } from "@/lib/ai/prompts";
import { requireTeam } from "@/lib/auth/helpers";

export async function POST(request: NextRequest) {
  try {
    await requireTeam();

    const body = await request.json();
    const { draft, clientName, projectName, question } = body as {
      draft: string;
      clientName?: string;
      projectName?: string;
      question?: string;
    };

    if (!draft) {
      return NextResponse.json(
        { success: false, error: { code: "CB-API-001", message: "Draft text is required" } },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2048,
      system: REPLY_POLISH_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildReplyPolishPrompt({ draft, clientName, projectName, question }),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { success: false, error: { code: "CB-INT-002", message: "AI returned no content" } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { polished: textBlock.text } });
  } catch (err) {
    console.error("[CB-INT-002] Reply polish failed:", err);
    return NextResponse.json(
      { success: false, error: { code: "CB-INT-002", message: "Failed to polish reply" } },
      { status: 500 }
    );
  }
}
