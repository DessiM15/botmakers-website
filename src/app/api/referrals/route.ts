// SPEC: SPEC-WORKFLOWS > Workflow 2: Referral Submission
// DEP-MAP: Referral > SERVER > POST /api/referrals
import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { referrers, leads, activityLog } from "@/lib/db/schema";
import { referralFormSchema } from "@/lib/types/schemas";
import { getReferralFormLimiter } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/client";
import { teamLeadNotification } from "@/lib/email/templates/lead-notification";
import { referrerThankYou } from "@/lib/email/templates/referrer-thank-you";
import { referredContactOutreach } from "@/lib/email/templates/referred-contact-outreach";
import { env } from "@/lib/env";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    // Validate input
    const parsed = referralFormSchema.safeParse(body);
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
      const { success: withinLimit } = await getReferralFormLimiter().limit(ip);
      if (!withinLimit) {
        return NextResponse.json(
          { success: false, error: { code: "CB-API-003", message: "Too many submissions. Please try again later." } },
          { status: 429 }
        );
      }
    } catch (rateLimitErr) {
      console.error("[CB-API-003] Rate limiter failed (allowing request):", rateLimitErr);
    }

    // Upsert referrer by email
    const slug = slugify(data.referrer_name) + "-" + Date.now().toString(36);
    const existingReferrer = await db.query.referrers.findFirst({
      where: eq(referrers.email, data.referrer_email),
    });

    let referrerId: string;

    if (existingReferrer) {
      referrerId = existingReferrer.id;
      await db
        .update(referrers)
        .set({
          fullName: data.referrer_name,
          company: data.referrer_company || null,
          feedback: data.feedback || null,
          totalReferrals: sql`${referrers.totalReferrals} + ${data.contacts.length}`,
          ipAddress: ip,
          updatedAt: new Date(),
        })
        .where(eq(referrers.id, existingReferrer.id));
    } else {
      const [newReferrer] = await db
        .insert(referrers)
        .values({
          slug,
          fullName: data.referrer_name,
          email: data.referrer_email,
          company: data.referrer_company || null,
          feedback: data.feedback || null,
          totalReferrals: data.contacts.length,
          ipAddress: ip,
        })
        .returning();

      if (!newReferrer) {
        return NextResponse.json(
          { success: false, error: { code: "CB-DB-001", message: "Failed to save. Please try again." } },
          { status: 500 }
        );
      }
      referrerId = newReferrer.id;
    }

    // Insert leads for each referred contact
    const insertedLeads: Array<{ id: string; fullName: string; email: string }> = [];
    for (const contact of data.contacts) {
      const [lead] = await db
        .insert(leads)
        .values({
          fullName: contact.full_name,
          email: contact.email,
          phone: contact.phone || null,
          companyName: contact.company_name || null,
          projectDetails: contact.notes || null,
          source: "referral",
          pipelineStage: "new_lead",
          referredBy: referrerId,
        })
        .returning({ id: leads.id, fullName: leads.fullName, email: leads.email });

      if (lead) {
        insertedLeads.push(lead);
      }
    }

    // Send team notification emails for each referred lead
    const teamEmails = env.TEAM_NOTIFICATION_EMAILS
      ? env.TEAM_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
      : [];

    for (const lead of insertedLeads) {
      if (teamEmails.length > 0) {
        const notification = teamLeadNotification({
          fullName: lead.fullName,
          email: lead.email,
          score: null,
          aiSummary: `Referred by ${data.referrer_name} (${data.referrer_email})`,
        });
        sendEmail({
          to: teamEmails,
          subject: `[Referral] ${notification.subject}`,
          html: notification.html,
          from: env.EMAIL_LEADS_FROM,
        }).catch((err) => console.error("[CB-INT-001] Team referral notification failed:", err));
      }

      // Send outreach email to referred contact
      const outreach = referredContactOutreach({
        contactName: lead.fullName,
        contactEmail: lead.email,
        referrerName: data.referrer_name,
      });
      sendEmail({
        to: lead.email,
        subject: outreach.subject,
        html: outreach.html,
        from: env.EMAIL_LEADS_FROM,
      }).catch((err) => console.error("[CB-INT-001] Referred contact outreach failed:", err));
    }

    // Send referrer thank you email
    const thankYou = referrerThankYou({
      fullName: data.referrer_name,
      referredNames: data.contacts.map((c) => c.full_name),
    });
    sendEmail({
      to: data.referrer_email,
      subject: thankYou.subject,
      html: thankYou.html,
      from: env.EMAIL_LEADS_FROM,
    }).catch((err) => console.error("[CB-INT-001] Referrer thank you failed:", err));

    // Log to activity_log
    await db.insert(activityLog).values({
      actorType: "system",
      action: "referral.created",
      entityType: "referrer",
      entityId: referrerId,
      metadata: {
        referrer_email: data.referrer_email,
        referred_count: insertedLeads.length,
        referred_emails: insertedLeads.map((l) => l.email),
      },
    }).catch((err) => console.error("[CB-DB-001] Activity log failed:", err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/referrals] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: { code: "CB-DB-001", message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}
