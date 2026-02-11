// Email service using Resend.
// Once RESEND_API_KEY is set, emails will send. Until then, they log to console.

import { Resend } from "resend";
import type { LeadRecord, AIInternalAnalysis, AIProspectOutput } from "./types";
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

export async function sendInternalReviewEmail(
  lead: LeadRecord,
  analysis: AIInternalAnalysis,
  approveToken: string
) {
  const resend = getResendClient();
  const to = Object.values(INTERNAL_TEAM);
  const subject = `[New Lead] ${lead.companyName || lead.fullName} — ${lead.projectType} (${analysis.leadScore})`;
  const approveUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://botmakers.ai"}/api/leads/${lead.id}/approve?token=${approveToken}`;

  const html = `
    <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
      <div style="background: #033457; padding: 24px 32px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">New Lead Submission</h1>
        <div style="display: inline-block; background: ${analysis.leadScore === 'High' ? '#03FF00' : analysis.leadScore === 'Medium' ? '#FFA500' : '#FF4444'}; color: #033457; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; margin-top: 8px;">
          ${analysis.leadScore} Priority
        </div>
      </div>

      <div style="padding: 32px;">
        <h2 style="color: #033457; font-size: 16px; margin: 0 0 16px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${lead.fullName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #033457;">${lead.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;"><a href="tel:${lead.phone}" style="color: #033457;">${lead.phone}</a></td></tr>
          ${lead.companyName ? `<tr><td style="padding: 8px 0; color: #666;">Company</td><td style="padding: 8px 0;">${lead.companyName}</td></tr>` : ""}
        </table>

        <h2 style="color: #033457; font-size: 16px; margin: 0 0 16px;">Project Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 8px 0; color: #666; width: 140px;">Type</td><td style="padding: 8px 0;">${lead.projectType}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Timeline</td><td style="padding: 8px 0;">${lead.projectTimeline}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">SMS Consent</td><td style="padding: 8px 0;">${lead.smsConsent ? "Yes" : "No"}</td></tr>
        </table>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0; color: #333; white-space: pre-wrap;">${lead.projectDetails}</p>
        </div>

        <h2 style="color: #033457; font-size: 16px; margin: 0 0 16px;">AI Analysis</h2>
        <div style="background: #f0f7ff; padding: 16px; border-radius: 8px; border-left: 4px solid #033457; margin-bottom: 16px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #033457;">Summary</p>
          <p style="margin: 0; color: #333;">${analysis.projectSummary}</p>
        </div>
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
          <div style="flex: 1; background: #f5f5f5; padding: 12px; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 12px;">Complexity</p>
            <p style="margin: 4px 0 0; font-weight: 600;">${analysis.complexityAssessment.level}</p>
          </div>
          <div style="flex: 1; background: #f5f5f5; padding: 12px; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 12px;">Est. Effort</p>
            <p style="margin: 4px 0 0; font-weight: 600;">${analysis.estimatedEffort}</p>
          </div>
        </div>

        <p style="font-weight: 600; color: #033457; margin: 16px 0 8px;">Key Questions for Discovery Call:</p>
        <ul style="margin: 0; padding-left: 20px; color: #333;">
          ${analysis.keyQuestions.map((q) => `<li style="margin-bottom: 4px;">${q}</li>`).join("")}
        </ul>

        ${analysis.redFlags.length > 0 ? `
          <p style="font-weight: 600; color: #FF4444; margin: 16px 0 8px;">Red Flags:</p>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            ${analysis.redFlags.map((f) => `<li style="margin-bottom: 4px;">${f}</li>`).join("")}
          </ul>
        ` : ""}

        <div style="background: #03FF00; padding: 12px 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; font-weight: 600; color: #033457;">Recommended Next Step: ${analysis.recommendedNextStep}</p>
        </div>

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
          <a href="${approveUrl}" style="display: inline-block; background: #033457; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Send Detailed Follow-Up Email
          </a>
          <p style="margin: 12px 0 0; color: #999; font-size: 12px;">Click to send the prospect a detailed project breakdown</p>
        </div>
      </div>
    </div>
  `;

  if (resend) {
    await resend.emails.send({ from: FROM_LEADS, to, subject, html });
    console.log("[Email] Internal review sent to:", to.join(", "));
  } else {
    console.log("[Email Preview - Internal Review]");
    console.log("To:", to.join(", "));
    console.log("Subject:", subject);
    console.log("Approve URL:", approveUrl);
  }
}

export async function sendProspectSummaryEmail(
  lead: LeadRecord,
  prospect: AIProspectOutput
) {
  const resend = getResendClient();
  const firstName = lead.fullName.split(" ")[0];
  const subject = `${firstName}, here is your project summary from Botmakers.ai`;
  const calLink = "https://cal.com/botmakers/30min";

  const html = `
    <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #033457; padding: 32px; text-align: center;">
        <img src="https://botmakers.ai/assets/botmakers-white-green-logo.png" alt="Botmakers.ai" style="height: 32px;" />
      </div>

      <div style="padding: 32px;">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Hi ${firstName},</p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for reaching out to Botmakers.ai! We've reviewed your project inquiry and put together an initial summary for you.
        </p>

        <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #033457; margin: 24px 0;">
          <h3 style="color: #033457; margin: 0 0 8px; font-size: 16px;">Our Understanding of Your Project</h3>
          <p style="color: #333; margin: 0; line-height: 1.6;">${prospect.projectUnderstanding}</p>
        </div>

        <h3 style="color: #033457; font-size: 16px; margin: 24px 0 16px;">Recommended Project Path</h3>
        ${prospect.recommendedPath
          .map(
            (step, i) => `
          <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <div style="min-width: 36px; height: 36px; background: #033457; color: #03FF00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">${i + 1}</div>
            <div>
              <p style="margin: 0; font-weight: 600; color: #033457;">${step.phase}</p>
              <p style="margin: 4px 0 0; color: #666; font-size: 14px; line-height: 1.5;">${step.description}</p>
            </div>
          </div>
        `
          )
          .join("")}

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="color: #033457; margin: 0 0 8px; font-size: 16px;">What Happens Next</h3>
          <p style="color: #333; margin: 0; line-height: 1.6;">${prospect.whatHappensNext}</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <p style="color: #666; margin: 0 0 16px;">Want to fast-track the conversation?</p>
          <a href="${calLink}" style="display: inline-block; background: #03FF00; color: #033457; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700;">
            Book a Call With Our Team
          </a>
        </div>

        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 32px;">
          Have questions? Simply reply to this email and our team will get back to you promptly.
        </p>

        <p style="color: #333; margin-top: 24px;">
          Best regards,<br />
          <strong>The Botmakers.ai Team</strong>
        </p>
      </div>

      <div style="background: #033457; padding: 20px 32px; text-align: center;">
        <p style="color: #ffffff80; font-size: 12px; margin: 0;">
          Botmakers.ai — A Division of BioQuest, Inc.<br />
          24285 Katy Freeway, Suite 300, Katy, TX 77494<br />
          866-753-8002 | info@botmakers.ai
        </p>
      </div>
    </div>
  `;

  if (resend) {
    await resend.emails.send({
      from: FROM_INFO,
      to: lead.email,
      subject,
      html,
      replyTo: "info@botmakers.ai",
    });
    console.log("[Email] Prospect summary sent to:", lead.email);
  } else {
    console.log("[Email Preview - Prospect Summary]");
    console.log("To:", lead.email);
    console.log("Subject:", subject);
  }
}
