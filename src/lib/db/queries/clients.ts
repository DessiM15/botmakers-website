// SPEC: CLAUDE.md > All DB queries in src/lib/db/queries/
// DEP-MAP: Auth > SERVER > getClientByAuthUserId, getClientByEmail
// DEP-MAP: Client Management > SERVER > getClients, getClientById
import { eq, desc, sql, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { clients, projects, invoices, contacts } from "@/lib/db/schema";

export async function getClientByAuthUserId(authUserId: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.authUserId, authUserId))
    .limit(1);

  return client ?? null;
}

export async function getClientByEmail(email: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, email))
    .limit(1);

  return client ?? null;
}

export async function getClientById(id: string) {
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);

  return client ?? null;
}

export async function getClients() {
  const allClients = await db
    .select()
    .from(clients)
    .orderBy(desc(clients.createdAt));

  const result = [];

  for (const client of allClients) {
    const [projectCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.clientId, client.id));

    const [openInvoices] = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.amount}), 0)` })
      .from(invoices)
      .where(
        sql`${invoices.clientId} = ${client.id} AND ${invoices.status} IN ('sent', 'viewed', 'overdue')`
      );

    const [lastContact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.clientId, client.id))
      .orderBy(desc(contacts.createdAt))
      .limit(1);

    result.push({
      ...client,
      projectCount: projectCount?.count ?? 0,
      openInvoiceTotal: parseFloat(openInvoices?.total ?? "0"),
      lastContactedAt: lastContact?.createdAt ?? null,
    });
  }

  return result;
}
