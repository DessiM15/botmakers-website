import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
import { getAmfnChatLimiter } from "@/lib/rate-limit";
import { AMFN_DOCUMENT_CONTEXT, AMFN_SYSTEM_PROMPT } from "@/lib/amfn/context";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  // Check AMFN session cookie
  const session = request.cookies.get("amfn_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limiter = getAmfnChatLimiter();
  const { success } = await limiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "You've reached the question limit. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "Messages array is required." },
      { status: 400 }
    );
  }

  const messages: ChatMessage[] = body.messages;
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "Last message must be from user." },
      { status: 400 }
    );
  }

  const anthropic = getAnthropicClient();
  const systemPrompt = `${AMFN_SYSTEM_PROMPT}\n\n--- DOCUMENT CONTENT ---\n${AMFN_DOCUMENT_CONTEXT}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2048,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const reply = textBlock?.type === "text" ? textBlock.text : "I was unable to generate a response.";

  return NextResponse.json({ reply });
}
