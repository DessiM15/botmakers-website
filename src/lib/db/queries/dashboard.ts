// SPEC: SPEC-DEPENDENCY-MAP > CRM Dashboard > SERVER
// DEP-MAP: Dashboard > getMetrics, getAlerts, getRecentActivity
import { eq, and, sql, desc, count, or, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  leads,
  projects,
  invoices,
  payments,
  activityLog,
  projectMilestones,
  projectQuestions,
  calendarEvents,
} from "@/lib/db/schema";

export async function getMetrics() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const [leadsThisWeek] = await db
    .select({ count: count() })
    .from(leads)
    .where(gte(leads.createdAt, oneWeekAgo));

  const [activeProjects] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.status, "in_progress"));

  const [pipelineValue] = await db
    .select({ total: sql<string>`COALESCE(SUM(${projects.totalValue}), 0)` })
    .from(projects)
    .where(
      or(
        eq(projects.status, "draft"),
        eq(projects.status, "in_progress")
      )
    );

  const [revenueThisMonth] = await db
    .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(gte(payments.paidAt, firstOfMonth));

  return {
    leadsThisWeek: leadsThisWeek?.count ?? 0,
    activeProjects: activeProjects?.count ?? 0,
    pipelineValue: pipelineValue?.total ?? "0",
    revenueThisMonth: revenueThisMonth?.total ?? "0",
  };
}

export async function getAlerts() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const today = new Date().toISOString().split("T")[0];

  const staleLeads = await db
    .select()
    .from(leads)
    .where(
      and(
        or(
          eq(leads.pipelineStage, "new_lead"),
          eq(leads.pipelineStage, "contacted")
        ),
        sql`${leads.pipelineStageChangedAt} < ${sevenDaysAgo.toISOString()}`
      )
    )
    .limit(10);

  const overdueMilestones = await db
    .select()
    .from(projectMilestones)
    .where(
      and(
        sql`${projectMilestones.dueDate} < ${today}`,
        eq(projectMilestones.status, "pending")
      )
    )
    .limit(10);

  const pendingQuestions = await db
    .select()
    .from(projectQuestions)
    .where(eq(projectQuestions.status, "pending"))
    .limit(10);

  // Upcoming events (next 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const upcomingEvents = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        sql`${calendarEvents.startTime} >= ${now.toISOString()}`,
        sql`${calendarEvents.startTime} < ${sevenDaysFromNow.toISOString()}`
      )
    )
    .orderBy(calendarEvents.startTime)
    .limit(10);

  return { staleLeads, overdueMilestones, pendingQuestions, upcomingEvents };
}

export async function getRecentActivity(limit: number = 15) {
  return db
    .select()
    .from(activityLog)
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);
}
