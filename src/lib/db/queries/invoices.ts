// SPEC: SPEC-DEPENDENCY-MAP > Square Billing > SERVER
// DEP-MAP: Invoices > getInvoices, getInvoiceById
import { eq, desc, sql, count, and, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  invoices,
  invoiceLineItems,
  payments,
  clients,
  projects,
  teamUsers,
} from "@/lib/db/schema";

export async function getInvoices(filters?: {
  status?: string;
  clientId?: string;
  projectId?: string;
}) {
  let query = db
    .select({
      invoice: invoices,
      clientName: clients.fullName,
      clientEmail: clients.email,
      projectName: projects.name,
      createdByName: teamUsers.fullName,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .innerJoin(teamUsers, eq(invoices.createdBy, teamUsers.id))
    .orderBy(desc(invoices.createdAt))
    .$dynamic();

  if (filters?.status) {
    query = query.where(eq(invoices.status, filters.status as "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled"));
  }
  if (filters?.clientId) {
    query = query.where(eq(invoices.clientId, filters.clientId));
  }
  if (filters?.projectId) {
    query = query.where(eq(invoices.projectId, filters.projectId));
  }

  return query;
}

export async function getInvoiceById(id: string) {
  const [invoice] = await db
    .select({
      invoice: invoices,
      clientName: clients.fullName,
      clientEmail: clients.email,
      projectName: projects.name,
      createdByName: teamUsers.fullName,
    })
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .innerJoin(teamUsers, eq(invoices.createdBy, teamUsers.id))
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) return null;

  const lineItemRows = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, id))
    .orderBy(invoiceLineItems.sortOrder);

  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, id))
    .orderBy(desc(payments.paidAt));

  return { ...invoice, lineItems: lineItemRows, payments: paymentRows };
}

export async function getInvoiceSummary() {
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const [outstanding] = await db
    .select({ total: sql<string>`COALESCE(SUM(${invoices.amount}), 0)`, count: count() })
    .from(invoices)
    .where(
      sql`${invoices.status} IN ('sent', 'viewed', 'overdue')`
    );

  const [paidThisMonth] = await db
    .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`, count: count() })
    .from(payments)
    .where(gte(payments.paidAt, firstOfMonth));

  const [overdue] = await db
    .select({ total: sql<string>`COALESCE(SUM(${invoices.amount}), 0)`, count: count() })
    .from(invoices)
    .where(eq(invoices.status, "overdue"));

  return {
    outstanding: { total: outstanding?.total ?? "0", count: outstanding?.count ?? 0 },
    paidThisMonth: { total: paidThisMonth?.total ?? "0", count: paidThisMonth?.count ?? 0 },
    overdue: { total: overdue?.total ?? "0", count: overdue?.count ?? 0 },
  };
}

export async function getInvoiceBySquareId(squareInvoiceId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.squareInvoiceId, squareInvoiceId))
    .limit(1);

  return invoice ?? null;
}
