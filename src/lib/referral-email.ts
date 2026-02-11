// Referral email service using Resend.
// Sends warm intro emails to referrals, team notifications, and referrer thank-you.

import { Resend } from "resend";
import type { ReferralSubmission, ReferralSlot } from "./types";
import { INTERNAL_TEAM } from "./types";

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[Email] Resend API key not configured — emails will be logged only");
    return null;
  }
  return new Resend(key);
}

const FROM_INFO = process.env.RESEND_FROM_ADDRESS || "info@botmakers.ai";
const FROM_LEADS = process.env.RESEND_LEADS_FROM_ADDRESS || "leads@botmakers.ai";
const CAL_LINK = "https://cal.com/botmakers/30min";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://botmakers.ai";

// --- Warm Intro Email (sent to each referred contact) ---

export async function sendReferralWarmIntroEmail(
  submission: ReferralSubmission,
  referral: ReferralSlot
) {
  const resend = getResendClient();
  const referralFirstName = referral.name.split(" ")[0];
  const referrerFirstName = submission.referrerName.split(" ")[0];
  const subject = `${referrerFirstName} thought you might be interested in this`;

  const html = `
    <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #033457; padding: 32px; text-align: center;">
        <img src="${SITE_URL}/assets/botmakers-white-green-logo.png" alt="Botmakers.ai" style="height: 32px;" />
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${referralFirstName},</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Your colleague <strong>${submission.referrerName}</strong>${submission.referrerCompany ? ` from ${submission.referrerCompany}` : ""}
          thought you might be interested in what we&rsquo;re building at Botmakers.ai.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          We build custom AI-powered software and systems for businesses &mdash; from intelligent automation to
          predictive analytics. We deliver MVPs within one week so you can see results fast.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${CAL_LINK}" style="display: inline-block; background: #03FF00; color: #033457; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Book a Free Consultation
          </a>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Or if you&rsquo;d prefer, <a href="${SITE_URL}/#project-form" style="color: #033457; font-weight: 600;">fill out a quick project brief</a>
          and we&rsquo;ll send you a personalized summary.
        </p>
        <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
          If this isn&rsquo;t relevant, no worries at all &mdash; we won&rsquo;t follow up further unless you reach out.
        </p>
      </div>
      <div style="background: #033457; padding: 20px 32px; text-align: center;">
        <p style="color: #ffffff80; font-size: 12px; margin: 0;">
          Botmakers.ai &mdash; A Division of BioQuest, Inc.<br />
          24285 Katy Freeway, Suite 300, Katy, TX 77494<br />
          866-753-8002 | info@botmakers.ai
        </p>
      </div>
    </div>
  `;

  if (resend) {
    await resend.emails.send({
      from: FROM_INFO,
      to: referral.email,
      subject,
      html,
      replyTo: "info@botmakers.ai",
    });
    console.log("[Email] Warm intro sent to:", referral.email);
  } else {
    console.log("[Email Preview - Warm Intro]");
    console.log("To:", referral.email);
    console.log("Subject:", subject);
  }
}

// --- Team Notification Email (sent to Jay, Trent, Dee) ---

export async function sendReferralTeamNotificationEmail(
  submission: ReferralSubmission
) {
  const resend = getResendClient();
  const to = Object.values(INTERNAL_TEAM);
  const subject = `[Referral] ${submission.referrerName} submitted ${submission.referralCount} referral${submission.referralCount !== 1 ? "s" : ""}`;

  const referralRows = submission.referrals
    .map(
      (r, i) => `
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #03FF00;">
          <p style="margin: 0 0 8px; font-weight: 700; color: #033457;">Referral ${i + 1}: ${r.name}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #666; width: 80px;">Email</td><td><a href="mailto:${r.email}" style="color: #033457;">${r.email}</a></td></tr>
            <tr><td style="padding: 4px 0; color: #666;">Phone</td><td><a href="tel:${r.phone}" style="color: #033457;">${r.phone}</a></td></tr>
            ${r.company ? `<tr><td style="padding: 4px 0; color: #666;">Company</td><td>${r.company}</td></tr>` : ""}
          </table>
        </div>`
    )
    .join("");

  const feedbackSection = submission.industryFeedback
    ? `
        <h2 style="color: #033457; font-size: 16px; margin: 0 0 16px;">Industry Feedback</h2>
        <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; border-left: 4px solid #033457; margin-bottom: 24px;">
          <p style="margin: 0; color: #333; white-space: pre-wrap;">${submission.industryFeedback}</p>
        </div>`
    : "";

  const html = `
    <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
      <div style="background: #033457; padding: 24px 32px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">New Referral Submission</h1>
        <div style="display: inline-block; background: #03FF00; color: #033457; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; margin-top: 8px;">
          ${submission.referralCount} Referral${submission.referralCount !== 1 ? "s" : ""}
        </div>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #033457; font-size: 16px; margin: 0 0 16px;">Referrer Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${submission.referrerName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${submission.referrerEmail}" style="color: #033457;">${submission.referrerEmail}</a></td></tr>
          ${submission.referrerCompany ? `<tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${submission.referrerCompany}</td></tr>` : ""}
        </table>

        ${feedbackSection}

        <h2 style="color: #033457; font-size: 16px; margin: 0 0 16px;">Referred Contacts</h2>
        ${referralRows}

        <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; margin-top: 24px;">
          <p style="margin: 0; color: #033457; font-size: 14px;">
            &#9989; Warm intro emails have been sent to each referral.
          </p>
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Submitted: ${new Date(submission.submittedAt).toLocaleString()} | ID: ${submission.id}
        </p>
      </div>
    </div>
  `;

  if (resend) {
    await resend.emails.send({ from: FROM_LEADS, to, subject, html });
    console.log("[Email] Team notification sent to:", to.join(", "));
  } else {
    console.log("[Email Preview - Team Referral Notification]");
    console.log("To:", to.join(", "));
    console.log("Subject:", subject);
  }
}

// --- Referrer Thank-You Email ---

export async function sendReferrerThankYouEmail(
  submission: ReferralSubmission
) {
  const resend = getResendClient();
  const firstName = submission.referrerName.split(" ")[0];
  const subject = `Thank you for your referral${submission.referralCount > 1 ? "s" : ""}, ${firstName}!`;

  const referralList = submission.referrals
    .map(
      (r) =>
        `<li style="margin-bottom: 4px;">${r.name}${r.company ? ` (${r.company})` : ""}</li>`
    )
    .join("");

  const feedbackAck = submission.industryFeedback
    ? `<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        We also appreciate you sharing your perspective on what would be valuable in your industry.
        Feedback like yours helps shape our roadmap.
      </p>`
    : "";

  const html = `
    <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #033457; padding: 32px; text-align: center;">
        <img src="${SITE_URL}/assets/botmakers-white-green-logo.png" alt="Botmakers.ai" style="height: 32px;" />
      </div>
      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${firstName},</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          Thank you for referring ${submission.referralCount} contact${submission.referralCount !== 1 ? "s" : ""} to Botmakers.ai!
          We truly appreciate you spreading the word.
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
          We&rsquo;ll be reaching out to each person with a personalized introduction. If they&rsquo;re a good fit,
          we&rsquo;ll take great care of them &mdash; just as we would with any of our clients.
        </p>
        ${feedbackAck}
        <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #033457; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #033457;">Your referrals:</p>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            ${referralList}
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <p style="color: #666; margin: 0 0 16px;">Want to explore how AI could help your business?</p>
          <a href="${CAL_LINK}" style="display: inline-block; background: #03FF00; color: #033457; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
            Book a Call With Our Team
          </a>
        </div>
        <p style="color: #333; margin-top: 24px;">Best regards,<br /><strong>The Botmakers.ai Team</strong></p>
      </div>
      <div style="background: #033457; padding: 20px 32px; text-align: center;">
        <p style="color: #ffffff80; font-size: 12px; margin: 0;">
          Botmakers.ai &mdash; A Division of BioQuest, Inc.<br />
          24285 Katy Freeway, Suite 300, Katy, TX 77494<br />
          866-753-8002 | info@botmakers.ai
        </p>
      </div>
    </div>
  `;

  if (resend) {
    await resend.emails.send({
      from: FROM_INFO,
      to: submission.referrerEmail,
      subject,
      html,
      replyTo: "info@botmakers.ai",
    });
    console.log("[Email] Thank-you sent to:", submission.referrerEmail);
  } else {
    console.log("[Email Preview - Referrer Thank You]");
    console.log("To:", submission.referrerEmail);
    console.log("Subject:", subject);
  }
}
