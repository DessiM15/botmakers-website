// SPEC: CLAUDE.md > Email: Resend
// DEP-MAP: Cross-Cutting > Email Client
import { Resend } from "resend";
import { env } from "@/lib/env";

let _resend: Resend | undefined;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string } | null> {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: params.from ?? env.EMAIL_FROM,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error) {
      console.error("[CB-INT-001] Resend email failed:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[CB-INT-001] Resend email error:", err);
    return null;
  }
}
