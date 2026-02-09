import { NextRequest, NextResponse } from "next/server";

// Resend inbound email webhook handler.
// Receives prospect replies and triggers AI draft + team notification.
// Activated once Resend inbound is configured.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify Resend webhook signature
    // const signature = request.headers.get("resend-signature");

    console.log("[Webhook - Email] Inbound email received:", {
      from: body.from,
      subject: body.subject,
      text: body.text?.substring(0, 200),
    });

    // TODO: Match to lead by email address
    // TODO: Call Claude API with conversation history for draft reply
    // TODO: Send draft to internal team via Resend for approval
    // TODO: Store in conversations table

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook - Email] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
