import { NextRequest, NextResponse } from "next/server";
import { checkReferralRateLimit } from "@/lib/rate-limit";
import {
  sendReferralWarmIntroEmail,
  sendReferralTeamNotificationEmail,
  sendReferrerThankYouEmail,
} from "@/lib/referral-email";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { ReferralSubmission } from "@/lib/types";

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit check
    const { success: withinLimit } = await checkReferralRateLimit(ip);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ success: true, id: "ok" }, { status: 200 });
    }

    // Server-side validation
    if (!body.referrerName?.trim()) {
      return NextResponse.json(
        { error: "Your name is required" },
        { status: 400 }
      );
    }

    if (
      !body.referrerEmail?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.referrerEmail)
    ) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!body.referrals || !Array.isArray(body.referrals) || body.referrals.length === 0) {
      return NextResponse.json(
        { error: "At least one referral is required" },
        { status: 400 }
      );
    }

    // Validate each referral
    for (let i = 0; i < body.referrals.length; i++) {
      const r = body.referrals[i];

      if (!r.name?.trim()) {
        return NextResponse.json(
          { error: `Referral ${i + 1}: name is required` },
          { status: 400 }
        );
      }

      if (!r.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
        return NextResponse.json(
          { error: `Referral ${i + 1}: a valid email is required` },
          { status: 400 }
        );
      }

      const digits = (r.phone || "").replace(/\D/g, "");
      if (digits.length < 10) {
        return NextResponse.json(
          { error: `Referral ${i + 1}: a valid phone number is required` },
          { status: 400 }
        );
      }
    }

    // Build submission record (used for emails)
    const submission: ReferralSubmission = {
      id: crypto.randomUUID(),
      referrerName: body.referrerName.trim(),
      referrerEmail: body.referrerEmail.trim().toLowerCase(),
      referrerCompany: (body.referrerCompany || "").trim(),
      industryFeedback: (body.industryFeedback || "").trim(),
      referrals: body.referrals.map(
        (r: { name: string; email: string; phone: string; company?: string }) => ({
          name: r.name.trim(),
          email: r.email.trim().toLowerCase(),
          phone: r.phone.startsWith("+1")
            ? r.phone
            : `+1${r.phone.replace(/\D/g, "")}`,
          company: (r.company || "").trim(),
        })
      ),
      referralCount: body.referrals.length,
      submittedAt: new Date().toISOString(),
      ip,
    };

    // ── Store in Supabase ──────────────────────────────────────
    if (!supabaseAdmin) {
      console.error("[Referral] supabaseAdmin not configured — DB writes skipped");
    } else {
      // Upsert referrer by email
      const { data: existingReferrer } = await supabaseAdmin
        .from("referrers")
        .select("id, total_referrals")
        .eq("email", submission.referrerEmail)
        .maybeSingle();

      let referrerId: string;

      if (existingReferrer) {
        // Update existing referrer
        referrerId = existingReferrer.id;
        await supabaseAdmin
          .from("referrers")
          .update({
            full_name: submission.referrerName,
            company: submission.referrerCompany || null,
            feedback: submission.industryFeedback || null,
            total_referrals: (existingReferrer.total_referrals || 0) + submission.referrals.length,
            ip_address: ip,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReferrer.id);
      } else {
        // Create new referrer (with required slug + total_referrals)
        const { data: newReferrer, error: refError } = await supabaseAdmin
          .from("referrers")
          .insert({
            slug: slugify(submission.referrerName),
            full_name: submission.referrerName,
            email: submission.referrerEmail,
            company: submission.referrerCompany || null,
            feedback: submission.industryFeedback || null,
            total_referrals: submission.referrals.length,
            ip_address: ip,
          })
          .select("id")
          .single();

        if (refError || !newReferrer) {
          console.error("[Referral] Failed to create referrer:", refError);
          return NextResponse.json(
            { error: "Failed to save referral. Please try again." },
            { status: 500 }
          );
        }
        referrerId = newReferrer.id;
      }

      submission.id = referrerId;

      // Insert each referred contact as a LEAD (source="referral")
      for (const referral of submission.referrals) {
        const { error: leadError } = await supabaseAdmin
          .from("leads")
          .insert({
            full_name: referral.name,
            email: referral.email,
            phone: referral.phone,
            company_name: referral.company || null,
            source: "referral",
            pipeline_stage: "new_lead",
            referred_by: referrerId,
          });

        if (leadError) {
          console.error("[Referral] Failed to insert lead:", leadError);
        }
      }

      // Log activity
      supabaseAdmin
        .from("activity_log")
        .insert({
          actor_type: "system",
          action: "referral.created",
          entity_type: "referrer",
          entity_id: referrerId,
          metadata: {
            referrer_email: submission.referrerEmail,
            referred_count: submission.referrals.length,
            referred_emails: submission.referrals.map((r) => r.email),
          },
        })
        .then(({ error }) => {
          if (error) console.error("[Referral] Activity log failed:", error);
        });
    }

    console.log(
      "[Referral Stored]",
      submission.id,
      submission.referrerName,
      `(${submission.referralCount} referrals)`
    );

    // Send all emails in parallel
    const emailPromises = [
      ...submission.referrals.map((referral) =>
        sendReferralWarmIntroEmail(submission, referral)
      ),
      sendReferralTeamNotificationEmail(submission),
      sendReferrerThankYouEmail(submission),
    ];

    const results = await Promise.allSettled(emailPromises);
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(`[Referral Email ${i}] Failed:`, result.reason);
      }
    });

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API /api/referrals] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
