// SPEC: SPEC-WORKFLOWS > Workflow 9: Square Payment Received
// DEP-MAP: Square Billing > SERVER > handleSquareWebhook
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { invoices, payments, activityLog } from "@/lib/db/schema";
import { getInvoiceBySquareId } from "@/lib/db/queries/invoices";
import { getClientById } from "@/lib/db/queries/clients";
import { sendEmail } from "@/lib/email/client";
import { paymentReceivedAlert } from "@/lib/email/templates/payment-received";
import { paymentConfirmation } from "@/lib/email/templates/payment-confirmation";
import { verifySquareWebhookSignature } from "@/lib/integrations/square";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-square-hmacsha256-signature") ?? "";
    const url = request.url;

    // Verify signature
    if (env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
      if (!verifySquareWebhookSignature(body, signature, url)) {
        console.error("[CB-INT-003] Invalid Square webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(body) as {
      type: string;
      data?: {
        object?: {
          payment?: {
            id?: string;
            amount_money?: { amount?: number; currency?: string };
            order_id?: string;
          };
        };
        id?: string;
      };
    };

    // Only handle payment.completed events
    if (event.type !== "payment.completed") {
      return NextResponse.json({ received: true });
    }

    const payment = event.data?.object?.payment;
    if (!payment) {
      return NextResponse.json({ received: true });
    }

    const squarePaymentId = payment.id;
    const amountCents = payment.amount_money?.amount ?? 0;
    const amount = (Number(amountCents) / 100).toFixed(2);

    // Find invoice by square_invoice_id (order_id may map to invoice)
    // Square payments link to orders, and our invoices store square_invoice_id
    // We need to search by looking at what data is available
    const orderId = payment.order_id;

    // Try to find invoice - first by square_invoice_id if available
    let invoice = null;
    if (orderId) {
      invoice = await getInvoiceBySquareId(orderId);
    }

    if (!invoice) {
      console.warn("[CB-INT-003] No matching invoice for Square payment:", squarePaymentId);
      return NextResponse.json({ received: true });
    }

    // Idempotency: check if already paid
    if (invoice.status === "paid") {
      return NextResponse.json({ received: true, message: "Already processed" });
    }

    // Check for duplicate payment
    const existingPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.squarePaymentId, squarePaymentId ?? ""))
      .limit(1);

    if (existingPayments.length > 0) {
      return NextResponse.json({ received: true, message: "Duplicate payment" });
    }

    // Update invoice status
    await db
      .update(invoices)
      .set({
        status: "paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoice.id));

    // Insert payment record
    await db.insert(payments).values({
      invoiceId: invoice.id,
      clientId: invoice.clientId,
      squarePaymentId: squarePaymentId ?? null,
      amount,
      method: "square_invoice",
      paidAt: new Date(),
    });

    // Log activity
    await db
      .insert(activityLog)
      .values({
        actorType: "system",
        action: "payment.received",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: { squarePaymentId, amount, method: "square_invoice" },
      })
      .catch(() => {});

    // Send notifications
    const client = await getClientById(invoice.clientId);
    if (client) {
      // Notify team
      const teamEmails = env.TEAM_NOTIFICATION_EMAILS
        ? env.TEAM_NOTIFICATION_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
        : [];

      if (teamEmails.length > 0) {
        const teamTemplate = paymentReceivedAlert({
          clientName: client.fullName,
          invoiceTitle: invoice.title,
          amount,
        });
        sendEmail({
          to: teamEmails,
          subject: teamTemplate.subject,
          html: teamTemplate.html,
        }).catch((err) => console.error("[CB-INT-001] Payment team alert failed:", err));
      }

      // Send receipt to client
      const clientTemplate = paymentConfirmation({
        clientName: client.fullName,
        invoiceTitle: invoice.title,
        amount,
      });
      sendEmail({
        to: client.email,
        subject: clientTemplate.subject,
        html: clientTemplate.html,
        from: env.EMAIL_FROM,
      }).catch((err) => console.error("[CB-INT-001] Payment confirmation failed:", err));
    }

    return NextResponse.json({ received: true, invoiceId: invoice.id });
  } catch (err) {
    console.error("[CB-INT-003] Square webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
