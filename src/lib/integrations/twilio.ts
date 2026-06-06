// SPEC: CLAUDE.md > Tech Stack > Twilio (optional — graceful fallback)
// DEP-MAP: SMS > SERVER > sendSms, isTwilioConfigured
import { env } from "@/lib/env";

import type Twilio from "twilio";

let _client: ReturnType<typeof Twilio> | undefined;

function createClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require("twilio") as typeof Twilio;
  return twilio(env.TWILIO_ACCOUNT_SID!, env.TWILIO_AUTH_TOKEN!);
}

function getClient() {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}

/** Returns true if all 3 Twilio env vars are present */
export function isTwilioConfigured(): boolean {
  return !!(
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_PHONE_NUMBER
  );
}

interface SendSmsParams {
  to: string;
  body: string;
}

interface SendSmsResult {
  sid: string;
}

/**
 * Send an SMS via Twilio. Returns { sid } on success, null on failure.
 * Non-fatal: errors are logged (CB-INT-005) and null is returned.
 */
export async function sendSms(
  params: SendSmsParams
): Promise<SendSmsResult | null> {
  if (!isTwilioConfigured()) {
    return null;
  }

  try {
    const client = getClient();
    const message = await client.messages.create({
      to: params.to,
      from: env.TWILIO_PHONE_NUMBER!,
      body: params.body,
    });

    return { sid: message.sid };
  } catch (err) {
    console.error("[CB-INT-005] Twilio SMS failed:", err);
    return null;
  }
}
