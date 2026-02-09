// Twilio SMS service — placeholder until credentials are provided.
// Once TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set,
// SMS messages will send. Until then, they log to console.

import type { LeadRecord } from "./types";

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.warn("[SMS] Twilio not configured — messages will be logged only");
    return null;
  }

  // Dynamic import to avoid errors when twilio isn't configured
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require("twilio");
  return twilio(sid, token);
}

export async function sendConfirmationSMS(lead: LeadRecord) {
  if (!lead.smsConsent) {
    console.log("[SMS] No consent — skipping SMS for", lead.fullName);
    return;
  }

  const firstName = lead.fullName.split(" ")[0];
  const message =
    `Hi ${firstName}! This is Botmakers.ai confirming we received your project inquiry. ` +
    `We've sent a detailed summary to your email at ${lead.email}. ` +
    `Our team is reviewing your project and will follow up within 24 hrs. ` +
    `Questions? Reply here or call 866-753-8002. ` +
    `Reply STOP to opt out.`;

  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (client && from) {
    await client.messages.create({
      body: message,
      from,
      to: lead.phone,
    });
    console.log("[SMS] Confirmation sent to:", lead.phone);
  } else {
    console.log("[SMS Preview]");
    console.log("To:", lead.phone);
    console.log("Message:", message);
  }
}

export async function sendSMSReply(to: string, message: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (client && from) {
    await client.messages.create({ body: message, from, to });
    console.log("[SMS] Reply sent to:", to);
  } else {
    console.log("[SMS Preview - Reply]");
    console.log("To:", to);
    console.log("Message:", message);
  }
}
