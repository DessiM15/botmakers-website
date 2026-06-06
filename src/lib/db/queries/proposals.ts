// SPEC: SPEC-DEPENDENCY-MAP > AI Proposal Generation > SERVER
// DEP-MAP: Proposals > getProposals, getProposalById
import { eq, desc, sql, count, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  proposals,
  proposalLineItems,
  leads,
  clients,
  teamUsers,
} from "@/lib/db/schema";

export async function getProposals(filters?: {
  status?: string;
  clientId?: string;
  leadId?: string;
}) {
  let query = db
    .select({
      proposal: proposals,
      leadName: leads.fullName,
      clientName: clients.fullName,
      createdByName: teamUsers.fullName,
    })
    .from(proposals)
    .leftJoin(leads, eq(proposals.leadId, leads.id))
    .leftJoin(clients, eq(proposals.clientId, clients.id))
    .innerJoin(teamUsers, eq(proposals.createdBy, teamUsers.id))
    .orderBy(desc(proposals.createdAt))
    .$dynamic();

  if (filters?.status) {
    query = query.where(eq(proposals.status, filters.status as "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired"));
  }
  if (filters?.clientId) {
    query = query.where(eq(proposals.clientId, filters.clientId));
  }
  if (filters?.leadId) {
    query = query.where(eq(proposals.leadId, filters.leadId));
  }

  return query;
}

export async function getProposalById(id: string) {
  const [proposal] = await db
    .select({
      proposal: proposals,
      leadName: leads.fullName,
      leadEmail: leads.email,
      clientName: clients.fullName,
      clientEmail: clients.email,
      createdByName: teamUsers.fullName,
    })
    .from(proposals)
    .leftJoin(leads, eq(proposals.leadId, leads.id))
    .leftJoin(clients, eq(proposals.clientId, clients.id))
    .innerJoin(teamUsers, eq(proposals.createdBy, teamUsers.id))
    .where(eq(proposals.id, id))
    .limit(1);

  if (!proposal) return null;

  const lineItems = await db
    .select()
    .from(proposalLineItems)
    .where(eq(proposalLineItems.proposalId, id))
    .orderBy(proposalLineItems.sortOrder);

  return { ...proposal, lineItems };
}

export async function getProposalCount() {
  const [result] = await db.select({ count: count() }).from(proposals);
  return result?.count ?? 0;
}

export async function getProposalsByStatus() {
  const results = await db
    .select({
      status: proposals.status,
      count: count(),
      total: sql<string>`COALESCE(SUM(${proposals.totalAmount}), 0)`,
    })
    .from(proposals)
    .groupBy(proposals.status);

  return results;
}
