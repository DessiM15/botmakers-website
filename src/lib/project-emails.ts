// Project notification emails for admin dashboard and client portal.
// Follows same pattern as src/lib/email.ts (getResendClient with fallback).

import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://botmakers.ai";
const LOGO_URL = `${SITE_URL}/assets/botmakers-white-green-logo.png`;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background: #f5f5f5;">
  <div style="font-family: 'Inter Tight', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #033457; padding: 32px; text-align: center;">
      <img src="${LOGO_URL}" alt="Botmakers.ai" style="height: 32px;" />
    </div>
    <div style="padding: 32px;">
      ${content}
    </div>
    <div style="background: #033457; padding: 20px 32px; text-align: center;">
      <p style="color: #ffffff80; font-size: 12px; margin: 0;">
        Botmakers.ai &mdash; A Division of BioQuest, Inc.<br />
        24285 Katy Freeway, Suite 300, Katy, TX 77494<br />
        866-753-8002 | info@botmakers.ai
      </p>
    </div>
  </div>
</body>
</html>`;
}

function portalButton(text: string, href: string): string {
  return `<div style="text-align: center; margin: 32px 0;">
    <a href="${href}" style="display: inline-block; background: #03FF00; color: #033457; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
      ${text}
    </a>
  </div>`;
}

// 1. Milestone completed notification
export async function sendMilestoneCompletedEmail(
  project: { name: string; client_name: string; client_email: string; id: string },
  milestone: { title: string },
  progress: number
) {
  const resend = getResendClient();
  const firstName = project.client_name.split(" ")[0];
  const portalUrl = `${SITE_URL}/portal/projects/${project.id}`;

  const html = emailWrapper(`
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${firstName},</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Great news! A milestone on your project <strong>${project.name}</strong> has been completed:
    </p>
    <div style="background: #f0fdf0; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #03FF00; margin: 24px 0;">
      <p style="margin: 0; color: #333; font-weight: 600;">&check; ${milestone.title}</p>
    </div>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Your project is now <strong>${progress}% complete</strong>. Visit your portal to see the full progress.
    </p>
    ${portalButton("View Project Progress", portalUrl)}
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
      Questions? Reply to this email or submit a question through your portal.
    </p>
    <p style="color: #333; margin-top: 24px; line-height: 1.6;">
      Best,<br /><strong>The Botmakers Team</strong>
    </p>
  `);

  if (!resend) {
    console.log(`[Email] Milestone completed: ${milestone.title} → ${project.client_email}`);
    return;
  }

  await resend.emails.send({
    from: "Botmakers.ai <info@botmakers.ai>",
    to: project.client_email,
    subject: `Project Update: ${milestone.title} is complete!`,
    html,
  });
}

// 2. Demo shared notification
export async function sendDemoSharedEmail(
  project: { name: string; client_name: string; client_email: string; id: string },
  demo: { title: string; url: string; description?: string | null }
) {
  const resend = getResendClient();
  const firstName = project.client_name.split(" ")[0];
  const portalUrl = `${SITE_URL}/portal/projects/${project.id}`;

  const html = emailWrapper(`
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${firstName},</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We have a new demo ready for your project <strong>${project.name}</strong>:
    </p>
    <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #033457; margin: 24px 0;">
      <p style="margin: 0 0 8px; color: #033457; font-weight: 600;">${demo.title}</p>
      ${demo.description ? `<p style="margin: 0 0 12px; color: #666; font-size: 14px;">${demo.description}</p>` : ""}
      <a href="${demo.url}" style="display: inline-block; background: #033457; color: #ffffff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View Demo &rarr;
      </a>
    </div>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We&rsquo;d love your feedback! You can view all demos and submit questions through your portal.
    </p>
    ${portalButton("Open Portal", portalUrl)}
    <p style="color: #333; margin-top: 24px; line-height: 1.6;">
      Best,<br /><strong>The Botmakers Team</strong>
    </p>
  `);

  if (!resend) {
    console.log(`[Email] Demo shared: ${demo.title} → ${project.client_email}`);
    return;
  }

  await resend.emails.send({
    from: "Botmakers.ai <info@botmakers.ai>",
    to: project.client_email,
    subject: `New demo for ${project.name}`,
    html,
  });
}

// 3. Question replied notification
export async function sendQuestionRepliedEmail(
  project: { name: string; client_name: string; client_email: string; id: string },
  question: { question_text: string; reply_text: string }
) {
  const resend = getResendClient();
  const firstName = project.client_name.split(" ")[0];
  const portalUrl = `${SITE_URL}/portal/projects/${project.id}`;

  const html = emailWrapper(`
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${firstName},</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We&rsquo;ve responded to your question about <strong>${project.name}</strong>:
    </p>
    <div style="background: #f5f5f5; padding: 16px 20px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0; color: #666; font-size: 14px; font-style: italic;">&ldquo;${question.question_text}&rdquo;</p>
    </div>
    <div style="background: #f0fdf0; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #03FF00; margin: 16px 0;">
      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">${question.reply_text}</p>
    </div>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Have more questions? Submit them through your portal.
    </p>
    ${portalButton("Open Portal", portalUrl)}
    <p style="color: #333; margin-top: 24px; line-height: 1.6;">
      Best,<br /><strong>The Botmakers Team</strong>
    </p>
  `);

  if (!resend) {
    console.log(`[Email] Question replied → ${project.client_email}`);
    return;
  }

  await resend.emails.send({
    from: "Botmakers.ai <info@botmakers.ai>",
    to: project.client_email,
    subject: `Re: Your question about ${project.name}`,
    html,
  });
}

// 4. Welcome email for new client
export async function sendWelcomeEmail(
  project: { name: string; client_name: string; client_email: string }
) {
  const resend = getResendClient();
  const firstName = project.client_name.split(" ")[0];
  const portalUrl = `${SITE_URL}/portal/login`;

  const html = emailWrapper(`
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">Hi ${firstName},</p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      Welcome to Botmakers.ai! We&rsquo;re excited to start working on <strong>${project.name}</strong> with you.
    </p>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      We&rsquo;ve set up a project portal where you can:
    </p>
    <ul style="color: #333; font-size: 15px; line-height: 1.8; padding-left: 20px; margin: 0 0 16px;">
      <li>Track your project&rsquo;s progress and milestones</li>
      <li>View live demos as they become available</li>
      <li>Submit questions and get replies from our team</li>
    </ul>
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      To access your portal, simply enter your email address and we&rsquo;ll send you a magic link — no password needed.
    </p>
    ${portalButton("Access Your Portal", portalUrl)}
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 24px 0 0;">
      If you have any questions, reply to this email or contact us at info@botmakers.ai.
    </p>
    <p style="color: #333; margin-top: 24px; line-height: 1.6;">
      Best,<br /><strong>The Botmakers Team</strong>
    </p>
  `);

  if (!resend) {
    console.log(`[Email] Welcome email → ${project.client_email}`);
    return;
  }

  await resend.emails.send({
    from: "Botmakers.ai <info@botmakers.ai>",
    to: project.client_email,
    subject: `Welcome — Your Project Portal`,
    html,
  });
}

// 5. Team notification when client asks a question
export async function sendClientQuestionNotificationEmail(
  project: { name: string; client_name: string; id: string },
  question: string
) {
  const resend = getResendClient();
  const TEAM_EMAILS = [
    "jay@m.botmakers.ai",
    "tdaniel@botmakers.ai",
    "dessiah@m.botmakers.ai",
  ];

  const html = emailWrapper(`
    <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
      <strong>${project.client_name}</strong> submitted a question about <strong>${project.name}</strong>:
    </p>
    <div style="background: #f5f5f5; padding: 16px 20px; border-radius: 8px; border-left: 4px solid #033457; margin: 24px 0;">
      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">${question}</p>
    </div>
    ${portalButton("Reply in Admin", `${SITE_URL}/admin/projects/${project.id}`)}
  `);

  if (!resend) {
    console.log(`[Email] Client question notification → team`);
    return;
  }

  await resend.emails.send({
    from: "Botmakers.ai <leads@botmakers.ai>",
    to: TEAM_EMAILS,
    subject: `[Client Question] ${project.client_name} asked about ${project.name}`,
    html,
  });
}
