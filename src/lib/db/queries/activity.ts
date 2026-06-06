// SPEC: SPEC-DEPENDENCY-MAP > Activity Log > SERVER
// DEP-MAP: Activity > getActivityLog (paginated + filtered)
import { eq, and, desc, sql, count, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { activityLog, teamUsers } from "@/lib/db/schema";

export interface ActivityFilters {
  actorId?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getActivityLog(
  filters?: ActivityFilters,
  page: number = 1,
  pageSize: number = 25
) {
  const conditions = [];

  if (filters?.actorId) {
    conditions.push(eq(activityLog.actorId, filters.actorId));
  }
  if (filters?.action) {
    conditions.push(eq(activityLog.action, filters.action));
  }
  if (filters?.entityType) {
    conditions.push(eq(activityLog.entityType, filters.entityType));
  }
  if (filters?.dateFrom) {
    conditions.push(gte(activityLog.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    conditions.push(lte(activityLog.createdAt, new Date(filters.dateTo)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(activityLog)
    .where(whereClause);

  const total = totalResult?.count ?? 0;

  const entries = await db
    .select({
      entry: activityLog,
      actorName: teamUsers.fullName,
    })
    .from(activityLog)
    .leftJoin(teamUsers, eq(activityLog.actorId, teamUsers.id))
    .where(whereClause)
    .orderBy(desc(activityLog.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return {
    entries,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getDistinctActions() {
  const result = await db
    .selectDistinct({ action: activityLog.action })
    .from(activityLog)
    .orderBy(activityLog.action);

  return result.map((r) => r.action);
}

export async function getDistinctEntityTypes() {
  const result = await db
    .selectDistinct({ entityType: activityLog.entityType })
    .from(activityLog)
    .orderBy(activityLog.entityType);

  return result.map((r) => r.entityType);
}
