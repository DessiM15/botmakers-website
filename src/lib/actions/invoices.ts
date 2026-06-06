// SPEC: CLAUDE.md > Use Server Actions for mutations
// DEP-MAP: Square Billing > SERVER > createInvoice, sendViaSquare, generateCheckoutLink
"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  invoices,
  invoiceLineItems,
  payments,
  activityLog,
} from "@/lib/db/schema";
import { requireTeam } from "@/lib/auth/helpers";
import {
  createSquareInvoice,
  sendSquareInvoice,
  createSquareCheckoutLink,
} from "@/lib/integrations/square";
import { sendEmail } from "@/lib/email/client";
import { paymentReceivedAlert } from "@/lib/email/templates/payment-received";
import { paymentConfirmation } from "@/lib/email/templates/payment-confirmation";
import { getInvoiceById } from "@/lib/db/queries/invoices";
import type { InvoiceCreateInput } from "@/lib/types/schemas";
import { env } from "@/lib/env";

export async function createInvoice(data: InvoiceCreateInput) {
  try {
    const user = await requireTeam();

    const totalAmount = data.line_items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    const [invoice] = await db
      .insert(invoices)
      .values({
        clientId: data.client_id,
        projectId: data.project_id || null,
        title: data.title,
        description: data.description || null,
        amount: String(totalAmount),
        dueDate: data.due_date,
        createdBy: user.id,
      })
      .returning();

    // Insert line items
    if (data.line_items.length > 0) {
      await db.insert(invoiceLineItems).values(
        data.line_items.map((item, idx) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unit_price),
          total: String(item.quantity * item.unit_price),
          sortOrder: item.sort_order ?? idx,
        }))
      );
    }

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "invoice.created",
        entityType: "invoice",
        entityId: invoice.id,
        metadata: { title: invoice.title, amount: totalAmount },
      })
      .catch(() => {});

    revalidatePath("/admin/invoices");
    return { success: true, data: invoice };
  } catch {
    return {
      success: false,
      error: { code: "CB-DB-001", message: "Failed to create invoice" },
    };
  }
}

export async function sendViaSquare(invoiceId: string) {
  try {
    const user = await requireTeam();
    const invoiceData = await getInvoiceById(invoiceId);

    if (!invoiceData) {
      return {
        success: false,
        error: { code: "CB-DB-002", message: "Invoice not found" },
      };
    }

    // Create in Square
    const squareResult = await createSquareInvoice({
      clientEmail: invoiceData.clientEmail,
      clientName: invoiceData.clientName,
      title: invoiceData.invoice.title,
      lineItems: invoiceData.lineItems.map((li) => ({
        description: li.description,
        quantity: parseFloat(li.quantity),
        unitPrice: parseFloat(li.unitPrice),
      })),
      dueDate: invoiceData.invoice.dueDate ?? new Date().toISOString().split("T")[0],
    });

    if (!squareResult.success) {
      return {
        success: false,
        error: {
          code: "CB-INT-003",
          message: squareResult.error ?? "Square sync failed",
        },
      };
    }

    // Publish/send the invoice in Square
    if (squareResult.squareInvoiceId) {
      const sendResult = await sendSquareInvoice(
        squareResult.squareInvoiceId
      );
      if (!sendResult.success) {
        console.error("[CB-INT-003] Square send failed:", sendResult.error);
      }
    }

    // Update local invoice
    const [updated] = await db
      .update(invoices)
      .set({
        squareInvoiceId: squareResult.squareInvoiceId ?? null,
        squarePaymentUrl: squareResult.squarePaymentUrl ?? null,
        status: "sent",
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "invoice.sent",
        entityType: "invoice",
        entityId: invoiceId,
        metadata: {
          squareInvoiceId: squareResult.squareInvoiceId,
          title: invoiceData.invoice.title,
        },
      })
      .catch(() => {});

    revalidatePath(`/admin/invoices/${invoiceId}`);
    revalidatePath("/admin/invoices");
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: {
        code: "CB-INT-003",
        message: "Failed to send invoice via Square",
      },
    };
  }
}

export async function generateCheckoutLink(invoiceId: string) {
  try {
    const user = await requireTeam();
    const invoiceData = await getInvoiceById(invoiceId);

    if (!invoiceData) {
      return {
        success: false,
        error: { code: "CB-DB-002", message: "Invoice not found" },
      };
    }

    const result = await createSquareCheckoutLink({
      title: invoiceData.invoice.title,
      lineItems: invoiceData.lineItems.map((li) => ({
        description: li.description,
        quantity: parseFloat(li.quantity),
        unitPrice: parseFloat(li.unitPrice),
      })),
    });

    if (!result.success) {
      return {
        success: false,
        error: {
          code: "CB-INT-003",
          message: result.error ?? "Failed to create checkout link",
        },
      };
    }

    const [updated] = await db
      .update(invoices)
      .set({
        squarePaymentUrl: result.checkoutUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "invoice.checkout_link_created",
        entityType: "invoice",
        entityId: invoiceId,
      })
      .catch(() => {});

    revalidatePath(`/admin/invoices/${invoiceId}`);
    return { success: true, data: updated, checkoutUrl: result.checkoutUrl };
  } catch {
    return {
      success: false,
      error: {
        code: "CB-INT-003",
        message: "Failed to generate checkout link",
      },
    };
  }
}

export async function markInvoicePaid(invoiceId: string) {
  try {
    const user = await requireTeam();
    const invoiceData = await getInvoiceById(invoiceId);

    if (!invoiceData) {
      return {
        success: false,
        error: { code: "CB-DB-002", message: "Invoice not found" },
      };
    }

    const [updated] = await db
      .update(invoices)
      .set({
        status: "paid",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId))
      .returning();

    // Insert payment record
    await db.insert(payments).values({
      invoiceId,
      clientId: invoiceData.invoice.clientId,
      amount: invoiceData.invoice.amount,
      method: "manual",
      paidAt: new Date(),
    });

    await db
      .insert(activityLog)
      .values({
        actorId: user.id,
        actorType: "team",
        action: "payment.received",
        entityType: "invoice",
        entityId: invoiceId,
        metadata: {
          amount: invoiceData.invoice.amount,
          method: "manual",
        },
      })
      .catch(() => {});

    revalidatePath(`/admin/invoices/${invoiceId}`);
    revalidatePath("/admin/invoices");
    return { success: true, data: updated };
  } catch {
    return {
      success: false,
      error: {
        code: "CB-DB-001",
        message: "Failed to mark invoice as paid",
      },
    };
  }
}
