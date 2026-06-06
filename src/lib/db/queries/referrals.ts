// SPEC: SPEC-DEPENDENCY-MAP > Referrals > SERVER
// DEP-MAP: Referrals > getReferrers (with referred leads)
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { referrers, leads } from "@/lib/db/schema";

export async function getReferrers() {
  const allReferrers = await db
    .select()
    .from(referrers)
    .orderBy(desc(referrers.totalReferrals), desc(referrers.createdAt));

  const result = [];
  for (const referrer of allReferrers) {
    const referredLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.referredBy, referrer.id))
      .orderBy(desc(leads.createdAt));

    result.push({ ...referrer, referredLeads });
  }

  return result;
}
