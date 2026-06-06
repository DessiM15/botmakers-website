// SPEC: SPEC-PAGES > /admin/proposals/new — 3-step AI wizard
// DEP-MAP: AI Proposal Generation > UI
import { ProposalWizard } from "@/components/admin/proposal-wizard";
import { db } from "@/lib/db/client";
import { leads, clients } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function NewProposalPage() {
  const [allLeads, allClients] = await Promise.all([
    db
      .select({ id: leads.id, fullName: leads.fullName, email: leads.email, companyName: leads.companyName })
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(100),
    db
      .select({ id: clients.id, fullName: clients.fullName, email: clients.email, company: clients.company })
      .from(clients)
      .orderBy(desc(clients.createdAt))
      .limit(100),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Proposal</h1>
      <ProposalWizard leads={allLeads} clients={allClients} />
    </div>
  );
}
