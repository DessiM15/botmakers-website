// SPEC: CLAUDE.md > All DB queries in src/lib/db/queries/
// DEP-MAP: Lead Management > SERVER > getLeads, getLeadById, getLeadsByStage
import { eq, and, or, desc, asc, ilike, sql, count, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads, contacts, teamUsers } from "@/lib/db/schema";
import type { LeadFilters, PipelineStage } from "@/lib/types/leads";

export async function getLeads(filters: LeadFilters = {}) {
  const {
    search,
    source,
    score,
    stage,
    assignedTo,
    page = 1,
    perPage = 25,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(leads.fullName, `%${search}%`),
        ilike(leads.email, `%${search}%`),
        ilike(leads.companyName, `%${search}%`)
      )
    );
  }

  if (source) conditions.push(eq(leads.source, source));
  if (score) conditions.push(eq(leads.score, score));
  if (stage) conditions.push(eq(leads.pipelineStage, stage));
  if (assignedTo) conditions.push(eq(leads.assignedTo, assignedTo));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderCol = leads[sortBy as keyof typeof leads];
  const orderFn = sortOrder === "asc" ? asc : desc;

  const [data, [total]] = await Promise.all([
    db
      .select()
      .from(leads)
      .where(where)
      .orderBy(orderFn(orderCol as any))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ count: count() })
      .from(leads)
      .where(where),
  ]);

  return {
    data,
    total: total?.count ?? 0,
    page,
    perPage,
    totalPages: Math.ceil((total?.count ?? 0) / perPage),
  };
}

export async function getLeadById(id: string) {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);

  return lead ?? null;
}

export async function getLeadsByStage() {
  const allLeads = await db
    .select()
    .from(leads)
    .where(isNull(leads.convertedToClientId))
    .orderBy(desc(leads.createdAt));

  const grouped: Record<string, typeof allLeads> = {};
  for (const lead of allLeads) {
    const stage = lead.pipelineStage;
    if (!grouped[stage]) grouped[stage] = [];
    grouped[stage].push(lead);
  }

  return grouped;
}

export async function getContactsForLead(leadId: string) {
  return db
    .select()
    .from(contacts)
    .where(eq(contacts.leadId, leadId))
    .orderBy(desc(contacts.createdAt));
}

export async function getTeamMembers() {
  return db
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.isActive, true))
    .orderBy(asc(teamUsers.fullName));
}

export async function getStaleLeads(daysStale: number = 7) {
  const staleDate = new Date();
  staleDate.setDate(staleDate.getDate() - daysStale);

  return db
    .select()
    .from(leads)
    .where(
      and(
        isNull(leads.convertedToClientId),
        or(
          eq(leads.pipelineStage, "new_lead"),
          eq(leads.pipelineStage, "contacted")
        ),
        sql`${leads.pipelineStageChangedAt} < ${staleDate.toISOString()}`
      )
    )
    .orderBy(asc(leads.pipelineStageChangedAt));
}
