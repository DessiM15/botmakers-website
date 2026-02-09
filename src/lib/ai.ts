// Claude AI analysis engine for lead qualification.
// Requires ANTHROPIC_API_KEY to be set.

import Anthropic from "@anthropic-ai/sdk";
import type { LeadFormData, AIAnalysisResult } from "./types";

function getAnthropicClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.warn("[AI] Anthropic API key not configured — returning mock analysis");
    return null;
  }
  return new Anthropic({ apiKey: key });
}

const SYSTEM_PROMPT = `You are a project analyst for Botmakers.ai, an enterprise AI solutions company (a division of BioQuest, Inc., publicly traded BQST). Your role is to analyze inbound project inquiries and produce two outputs:

1. INTERNAL ANALYSIS (for the Botmakers team — Jay, Trent, and Dee):
   - Lead Score: High / Medium / Low based on project type, timeline urgency, company presence, and detail quality
   - Project Summary: 2-3 sentence plain-English summary
   - Complexity Assessment: Simple / Moderate / Complex with reasoning
   - Estimated Effort: Rough range (e.g., "2-4 weeks", "1-2 months")
   - Key Questions: 2-5 questions for the discovery call
   - Red Flags: Any concerns (vague scope, unrealistic timeline, etc.) — empty array if none
   - Recommended Next Step: Suggested action

2. PROSPECT-FACING OUTPUT (for the client email):
   - Project Understanding: Summary reflecting back their needs
   - Recommended Path: 3-5 phases of how Botmakers would approach the project
   - What Happens Next: Clear explanation of the review and follow-up process

IMPORTANT GUARDRAILS:
- Never promise specific pricing, hard timelines, or guarantees
- Only suggest ranges and recommendations
- Be professional, confident, and warm — matching the Botmakers brand voice
- Keep the prospect output high-level; detailed breakdowns come after internal team review

Respond ONLY with valid JSON matching this exact structure:
{
  "internal": {
    "leadScore": "High" | "Medium" | "Low",
    "projectSummary": "string",
    "complexityAssessment": { "level": "Simple" | "Moderate" | "Complex", "reasoning": "string" },
    "estimatedEffort": "string",
    "keyQuestions": ["string"],
    "redFlags": ["string"],
    "recommendedNextStep": "string"
  },
  "prospect": {
    "projectUnderstanding": "string",
    "recommendedPath": [{ "phase": "string", "description": "string" }],
    "whatHappensNext": "string"
  }
}`;

export async function analyzeLeadWithAI(
  data: LeadFormData
): Promise<AIAnalysisResult> {
  const client = getAnthropicClient();

  if (!client) {
    return getMockAnalysis(data);
  }

  const userMessage = `Analyze this project inquiry:

Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Company: ${data.companyName || "Not provided"}
Project Type: ${data.projectType}
Timeline: ${data.projectTimeline}
Project Details: ${data.projectDetails}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    let text =
      response.content[0].type === "text" ? response.content[0].text : "";
    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const result: AIAnalysisResult = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("[AI] Claude API error, falling back to mock analysis:", error instanceof Error ? error.message : error);
    return getMockAnalysis(data);
  }
}

function getMockAnalysis(data: LeadFormData): AIAnalysisResult {
  const isUrgent =
    data.projectTimeline === "ASAP / Urgent" ||
    data.projectTimeline === "1–3 Months";
  const hasCompany = !!data.companyName;
  const detailLength = data.projectDetails.length;

  let score: "High" | "Medium" | "Low" = "Medium";
  if (isUrgent && hasCompany && detailLength > 150) score = "High";
  else if (!isUrgent && detailLength < 100) score = "Low";

  return {
    internal: {
      leadScore: score,
      projectSummary: `${data.fullName}${data.companyName ? ` from ${data.companyName}` : ""} is looking for ${data.projectType} with a ${data.projectTimeline.toLowerCase()} timeline.`,
      complexityAssessment: {
        level: "Moderate",
        reasoning:
          "Based on the project type and description, this appears to be a standard enterprise engagement requiring discovery and scoping.",
      },
      estimatedEffort: "4-8 weeks",
      keyQuestions: [
        "What are the primary KPIs you want to improve with this solution?",
        "What does your current tech stack look like?",
        "Who are the key stakeholders and decision-makers?",
        "Do you have existing data pipelines we can leverage?",
      ],
      redFlags: [],
      recommendedNextStep: "Schedule a 30-minute discovery call to discuss project scope and requirements.",
    },
    prospect: {
      projectUnderstanding: `We understand you're looking for ${data.projectType.toLowerCase()} solutions to help transform your business operations. Based on your description, this aligns well with the enterprise AI solutions we build at Botmakers.`,
      recommendedPath: [
        { phase: "Discovery & Assessment", description: "We'll schedule a call to understand your business needs, existing systems, and success criteria in detail." },
        { phase: "Solution Architecture", description: "Our team will design a tailored solution blueprint addressing your specific requirements and technical constraints." },
        { phase: "Development & Integration", description: "We build and integrate the solution with your existing workflows, with regular check-ins and progress updates." },
        { phase: "Testing & Deployment", description: "Rigorous QA testing followed by a phased deployment to ensure zero disruption to your operations." },
        { phase: "Ongoing Support", description: "Post-launch monitoring, optimization, and support to ensure long-term success." },
      ],
      whatHappensNext: "Our team is reviewing your project details right now. You'll receive a follow-up from one of our specialists within 24 business hours. In the meantime, feel free to book a call directly if you'd like to fast-track the conversation.",
    },
  };
}
