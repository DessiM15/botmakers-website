// SPEC: CLAUDE.md > All DB queries in src/lib/db/queries/
// DEP-MAP: Auth > SERVER > getTeamUserByEmail, getActiveTeamUserByEmail
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { teamUsers } from "@/lib/db/schema";

export async function getTeamUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(teamUsers)
    .where(eq(teamUsers.email, email))
    .limit(1);

  return user ?? null;
}

export async function getActiveTeamUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(teamUsers)
    .where(and(eq(teamUsers.email, email), eq(teamUsers.isActive, true)))
    .limit(1);

  return user ?? null;
}
