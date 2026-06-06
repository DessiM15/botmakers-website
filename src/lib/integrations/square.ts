// SPEC: SPEC-DEPENDENCY-MAP > Square Billing > SERVER
// DEP-MAP: Square > createSquareInvoice, sendSquareInvoice, createSquareCheckoutLink
import { SquareClient, SquareEnvironment, WebhooksHelper } from "square";
import { env } from "@/lib/env";

let _squareClient: SquareClient | undefined;

function getSquareClient(): SquareClient {
  if (!_squareClient) {
    _squareClient = new SquareClient({
      token: env.SQUARE_ACCESS_TOKEN ?? "",
      environment:
        env.SQUARE_ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    });
  }
  return _squareClient;
}

function isSquareConfigured(): boolean {
  return !!(env.SQUARE_ACCESS_TOKEN && env.SQUARE_LOCATION_ID);
}

export interface SquareInvoiceInput {
  clientEmail: string;
  clientName: string;
  title: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate: string;
}

export async function createSquareInvoice(input: SquareInvoiceInput): Promise<{
  success: boolean;
  squareInvoiceId?: string;
  squarePaymentUrl?: string;
  error?: string;
}> {
  if (!isSquareConfigured()) {
    return { success: false, error: "Square is not configured" };
  }

  try {
    const client = getSquareClient();

    // Create order first
    const orderResponse = await client.orders.create({
      order: {
        locationId: env.SQUARE_LOCATION_ID!,
        lineItems: input.lineItems.map((item) => ({
          name: item.description,
          quantity: String(item.quantity),
          basePriceMoney: {
            amount: BigInt(Math.round(item.unitPrice * 100)),
            currency: "USD",
          },
        })),
      },
      idempotencyKey: crypto.randomUUID(),
    });

    const orderId = orderResponse.order?.id;
    if (!orderId) {
      return { success: false, error: "Failed to create Square order" };
    }

    // Create invoice
    const invoiceResponse = await client.invoices.create({
      invoice: {
        locationId: env.SQUARE_LOCATION_ID!,
        orderId,
        title: input.title,
        primaryRecipient: {
          emailAddress: input.clientEmail,
        },
        paymentRequests: [
          {
            requestType: "BALANCE",
            dueDate: input.dueDate,
          },
        ],
        deliveryMethod: "EMAIL",
        acceptedPaymentMethods: {
          card: true,
          bankAccount: true,
        },
      },
      idempotencyKey: crypto.randomUUID(),
    });

    const invoice = invoiceResponse.invoice;
    if (!invoice?.id) {
      return { success: false, error: "Failed to create Square invoice" };
    }

    return {
      success: true,
      squareInvoiceId: invoice.id,
      squarePaymentUrl: invoice.publicUrl ?? undefined,
    };
  } catch (err) {
    console.error("[CB-INT-003] Square createInvoice failed:", err);
    return { success: false, error: "Square API error" };
  }
}

export async function sendSquareInvoice(squareInvoiceId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isSquareConfigured()) {
    return { success: false, error: "Square is not configured" };
  }

  try {
    const client = getSquareClient();

    // Get current version
    const getResponse = await client.invoices.get({ invoiceId: squareInvoiceId });
    const version = getResponse.invoice?.version;

    if (version === undefined) {
      return { success: false, error: "Failed to get invoice version" };
    }

    await client.invoices.publish({
      invoiceId: squareInvoiceId,
      version: Number(version),
      idempotencyKey: crypto.randomUUID(),
    });

    return { success: true };
  } catch (err) {
    console.error("[CB-INT-003] Square sendInvoice failed:", err);
    return { success: false, error: "Square API error" };
  }
}

export async function createSquareCheckoutLink(input: {
  title: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}): Promise<{
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}> {
  if (!isSquareConfigured()) {
    return { success: false, error: "Square is not configured" };
  }

  try {
    const client = getSquareClient();

    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: crypto.randomUUID(),
      order: {
        locationId: env.SQUARE_LOCATION_ID!,
        lineItems: input.lineItems.map((item) => ({
          name: item.description,
          quantity: String(item.quantity),
          basePriceMoney: {
            amount: BigInt(Math.round(item.unitPrice * 100)),
            currency: "USD",
          },
        })),
      },
      checkoutOptions: {
        allowTipping: false,
      },
    });

    const url = response.paymentLink?.url;
    if (!url) {
      return { success: false, error: "Failed to create checkout link" };
    }

    return { success: true, checkoutUrl: url };
  } catch (err) {
    console.error("[CB-INT-003] Square checkout link failed:", err);
    return { success: false, error: "Square API error" };
  }
}

export async function verifySquareWebhookSignature(
  body: string,
  signature: string,
  url: string
): Promise<boolean> {
  if (!env.SQUARE_WEBHOOK_SIGNATURE_KEY) return false;

  try {
    return await WebhooksHelper.verifySignature({
      requestBody: body,
      signatureHeader: signature,
      signatureKey: env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      notificationUrl: url,
    });
  } catch {
    return false;
  }
}
