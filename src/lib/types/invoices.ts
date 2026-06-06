// SPEC: SPEC-DATA-MODEL.md > invoices, invoice_line_items, payments
import type { InferSelectModel } from "drizzle-orm";
import type {
  invoices,
  invoiceLineItems,
  payments,
} from "@/lib/db/schema";

export type Invoice = InferSelectModel<typeof invoices>;
export type InvoiceLineItem = InferSelectModel<typeof invoiceLineItems>;
export type Payment = InferSelectModel<typeof payments>;

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "cancelled";

export type PaymentMethod =
  | "square_invoice"
  | "square_checkout"
  | "manual"
  | "other";
