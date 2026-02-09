import { NextRequest, NextResponse } from "next/server";
import { sendSMSReply } from "@/lib/sms";

// Twilio inbound SMS webhook handler.
// Handles STOP/HELP and forwards other messages to the team.

export async function POST(request: NextRequest) {
  try {
    // TODO: Verify Twilio webhook signature (X-Twilio-Signature)
    // import twilio from "twilio";
    // const valid = twilio.validateRequest(...)

    const formData = await request.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;

    console.log("[Webhook - SMS] Inbound SMS from:", from, "Body:", body);

    const normalized = body?.trim().toUpperCase();

    // Handle STOP — Twilio auto-handles, but we update our records
    if (normalized === "STOP") {
      console.log("[SMS] STOP received from:", from);
      // TODO: Update lead record in Supabase: sms_opted_out = true
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Handle HELP
    if (normalized === "HELP") {
      await sendSMSReply(
        from,
        "Botmakers.ai support. Call 866-753-8002 or email info@botmakers.ai. Reply STOP to opt out."
      );
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // For other messages: send acknowledgment and notify team
    await sendSMSReply(
      from,
      "Thanks for the additional info! Our team is reviewing and will get back to you shortly."
    );

    // TODO: Look up lead by phone number
    // TODO: Call Claude API for draft reply
    // TODO: Send full message + AI draft to internal team via Resend
    // TODO: Store in conversations table

    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  } catch (error) {
    console.error("[Webhook - SMS] Error:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" }, status: 500 }
    );
  }
}
