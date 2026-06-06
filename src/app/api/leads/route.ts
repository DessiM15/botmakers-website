// SPEC: SPEC-WORKFLOWS > Workflow 1: Lead Submission
// DEP-MAP: Lead Management > SERVER > POST /api/leads
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { leads, activityLog } from "@/lib/db/schema";
import { leadFormSchema } from "@/lib/types/schemas";
import { getLeadFormLimiter } from "@/lib/rate-limit";
import { getAnthropicClient } from "@/lib/ai/client";
import { LEAD_ANALYSIS_SYSTEM, buildLeadAnalysisPrompt } from "@/lib/ai/prompts";
import { sendEmail } from "@/lib/email/client";
import { teamLeadNotification } from "@/lib/email/templates/lead-notification";
import { prospectConfirmation } from "@/lib/email/templates/prospect-confirmation";
import { env } from "@/lib/env";
import type { AIAnalysis } from "@/lib/types/leads";

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body: unknown = await request.json();

    // Honeypot check — if _hp field is filled, silently succeed (bot)
    if (typeof body === "object" && body !== null && "_hp" in body && (body as Record<string, unknown>)._hp) {
      return NextResponse.json({ success: true });
    }

    // Validate input
    const parsed = leadFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "CB-API-002", message: parsed.error.issues[0]?.message ?? "Invalid input" } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Rate limit by IP (fail-open if Redis is unreachable)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    try {
      const { success: withinLimit } = await getLeadFormLimiter().limit(ip);
      if (!withinLimit) {
        return NextResponse.json(
          { success: false, error: { code: "CB-API-003", message: "Too many submissions. Please try again later." } },
          { status: 429 }
        );
      }
    } catch (rateLimitErr) {
      console.error("[CB-API-003] Rate limiter failed (allowing request):", rateLimitErr);
    }

    // Truncate project_details at 5000 chars server-side
    const projectDetails = data.project_details?.substring(0, 5000) ?? null;

    // Insert lead
    const [lead] = await db
      .insert(leads)
      .values({
        fullName: data.full_name,
        email: data.email,
        phone: data.phone || null,
        companyName: data.company_name || null,
        projectType: data.project_type,
        projectTimeline: data.project_timeline,
        existingSystems: data.existing_systems || null,
        referralSource: data.referral_source || null,
        preferredContact: data.preferred_contact,
        projectDetails: projectDetails,
        smsConsent: data.sms_consent,
        smsConsentTimestamp: data.sms_consent ? new Date() : null,
        smsConsentIp: data.sms_consent ? ip : null,
        source: "web_form",
        pipelineStage: "new_lead",
      })
      .returning();

    if (!lead) {
      return NextResponse.json(
        { success: false, error: { code: "CB-DB-001", message: "Failed to save your submission. Please try again." } },
        { status: 500 }
      );
    }

    // AI analysis (non-blocking — proceed even if it fails)
    let aiAnalysis: AIAnalysis | null = null;
    let aiSummary: string | null = null;
    try {
      const anthropic = getAnthropicClient();
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: LEAD_ANALYSIS_SYSTEM,
        messages: [{ role: "user", content: buildLeadAnalysisPrompt(lead) }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        aiAnalysis = JSON.parse(textBlock.text) as AIAnalysis;
        aiSummary = aiAnalysis.summary;

        // Update lead with AI analysis
        const { eq } = await import("drizzle-orm");
        await db
          .update(leads)
          .set({
            aiInternalAnalysis: aiAnalysis,
            aiProspectSummary: aiSummary,
            score: aiAnalysis.score,
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));
      }
    } catch (err) {
      console.error("[CB-INT-002] Claude AI analysis failed:", err);
      // Proceed without AI analysis
    }

    // Send team notification email
    const teamEmails = env.TEAM_NOTIFICATION_EMAILS
      ? env.TEAM_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : [];
    if (teamEmails.length > 0) {
      const notification = teamLeadNotification({
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone,
        companyName: lead.companyName,
        projectType: lead.projectType,
        projectTimeline: lead.projectTimeline,
        projectDetails: lead.projectDetails,
        score: aiAnalysis?.score ?? null,
        aiSummary,
      });
      sendEmail({
        to: teamEmails,
        subject: notification.subject,
        html: notification.html,
        from: env.EMAIL_LEADS_FROM,
      }).catch((err) => console.error("[CB-INT-001] Team notification failed:", err));
    }

    // Send prospect confirmation email
    const confirmation = prospectConfirmation({
      fullName: lead.fullName,
      aiSummary,
    });
    sendEmail({
      to: lead.email,
      subject: confirmation.subject,
      html: confirmation.html,
      from: env.EMAIL_LEADS_FROM,
    }).catch((err) => console.error("[CB-INT-001] Prospect confirmation failed:", err));

    // Log to activity_log
    await db.insert(activityLog).values({
      actorType: "system",
      action: "lead.created",
      entityType: "lead",
      entityId: lead.id,
      metadata: { source: "web_form", email: lead.email },
    }).catch((err) => console.error("[CB-DB-001] Activity log failed:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/leads] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "CB-DB-001", message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}
