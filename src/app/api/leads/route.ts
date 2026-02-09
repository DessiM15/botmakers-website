import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { insertLead, updateLead } from "@/lib/supabase";
import { analyzeLeadWithAI } from "@/lib/ai";
import { sendInternalReviewEmail, sendProspectSummaryEmail } from "@/lib/email";
import { sendConfirmationSMS } from "@/lib/sms";
import { generateApproveToken } from "@/lib/tokens";
import type { LeadFormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit check
    const { success: withinLimit } = await checkRateLimit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { fullName, email, phone, projectType, projectTimeline, projectDetails } =
      body as LeadFormData;

    if (!fullName?.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    const phoneDigits = (phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }
    if (!projectType?.trim()) {
      return NextResponse.json({ error: "Project type is required" }, { status: 400 });
    }
    if (!projectTimeline?.trim()) {
      return NextResponse.json({ error: "Project timeline is required" }, { status: 400 });
    }
    if (!projectDetails?.trim() || projectDetails.trim().length < 50) {
      return NextResponse.json(
        { error: "Project details must be at least 50 characters" },
        { status: 400 }
      );
    }

    const formData: LeadFormData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.startsWith("+1") ? phone : `+1${phoneDigits}`,
      companyName: (body.companyName || "").trim(),
      projectType,
      projectTimeline,
      projectDetails: projectDetails.trim(),
      smsConsent: !!body.smsConsent,
    };

    // Store lead
    const lead = await insertLead({ ...formData, smsConsentIp: ip });

    // Run AI analysis
    const analysis = await analyzeLeadWithAI(formData);

    // Update lead with AI results
    await updateLead(lead.id, {
      leadScore: analysis.internal.leadScore,
      aiInternalAnalysis: analysis.internal,
      aiProspectSummary: JSON.stringify(analysis.prospect),
      status: "processed",
    });

    // Generate approve token for the detailed follow-up link
    const approveToken = generateApproveToken(lead.id);

    // Send communications in parallel
    await Promise.allSettled([
      sendInternalReviewEmail(lead, analysis.internal, approveToken),
      sendProspectSummaryEmail(lead, analysis.prospect),
      sendConfirmationSMS({ ...lead, ...formData }),
    ]);

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 200 });
  } catch (error) {
    console.error("[API /api/leads] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
