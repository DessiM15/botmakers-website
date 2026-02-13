import { NextRequest, NextResponse } from "next/server";
import { checkReferralRateLimit } from "@/lib/rate-limit";
import {
  sendReferralWarmIntroEmail,
  sendReferralTeamNotificationEmail,
  sendReferrerThankYouEmail,
} from "@/lib/referral-email";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { ReferralSubmission } from "@/lib/types";

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

    // Build submission record
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

    // Store in Supabase
    if (supabaseAdmin) {
      const { data: referrer, error: refError } = await supabaseAdmin
        .from("referrers")
        .insert({
          full_name: submission.referrerName,
          email: submission.referrerEmail,
          company: submission.referrerCompany || null,
          feedback: submission.industryFeedback || null,
          ip_address: ip,
        })
        .select("id")
        .single();

      if (!refError && referrer) {
        const referralRows = submission.referrals.map((r) => ({
          referrer_id: referrer.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          company: r.company || null,
          status: "pending",
        }));
        await supabaseAdmin.from("referrals").insert(referralRows);
        submission.id = referrer.id;
      } else {
        console.error("[Referral Store] Error:", refError);
      }
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
