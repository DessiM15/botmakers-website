// SPEC: SPEC-DEPENDENCY-MAP > AI Proposal Generation > SERVER
// DEP-MAP: AI > POST /api/ai/generate-proposal
import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/ai/client";
import { PROPOSAL_GENERATION_SYSTEM, buildProposalPrompt } from "@/lib/ai/prompts";
import { requireTeam } from "@/lib/auth/helpers";

export async function POST(request: NextRequest) {
  try {
    await requireTeam();

    const body = await request.json();
    const { clientName, projectType, discoveryNotes, pricingType } = body as {
      clientName?: string;
      projectType?: string;
      discoveryNotes?: string;
      pricingType?: string;
    };

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: PROPOSAL_GENERATION_SYSTEM,
      messages: [
        {
          role: "user",
          content: buildProposalPrompt({ clientName, projectType, discoveryNotes, pricingType }),
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

    const proposal = JSON.parse(textBlock.text);
    return NextResponse.json({ success: true, data: proposal });
  } catch (err) {
    console.error("[CB-INT-002] Proposal generation failed:", err);
    return NextResponse.json(
      { success: false, error: { code: "CB-INT-002", message: "Failed to generate proposal" } },
      { status: 500 }
    );
  }
}
