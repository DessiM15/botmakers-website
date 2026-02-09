import { NextRequest, NextResponse } from "next/server";
import { analyzeLeadWithAI } from "@/lib/ai";
import type { LeadFormData } from "@/lib/types";

// Internal-only route for testing AI analysis
export async function POST(request: NextRequest) {
  try {
    const body: LeadFormData = await request.json();
    const result = await analyzeLeadWithAI(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API /api/ai/analyze] Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
