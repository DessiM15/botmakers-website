// SPEC: SPEC-PAGES > /admin/leads — Filterable table
// DEP-MAP: Lead Management > UI > /admin/leads
import { getLeads, getTeamMembers } from "@/lib/db/queries/leads";
import { PIPELINE_STAGE_LABELS } from "@/lib/types/constants";
import { LeadTable } from "@/components/admin/lead-table";
import type { LeadFilters } from "@/lib/types/leads";

interface LeadsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;

  const filters: LeadFilters = {
    search: params.search,
    source: params.source as LeadFilters["source"],
    score: params.score as LeadFilters["score"],
    stage: params.stage as LeadFilters["stage"],
    assignedTo: params.assigned,
    page: params.page ? parseInt(params.page) : 1,
    perPage: 25,
  };

  const [result, teamMembers] = await Promise.all([
    getLeads(filters),
    getTeamMembers(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leads</h1>
      <LeadTable
        leads={result.data}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        stageLabels={PIPELINE_STAGE_LABELS}
        teamMembers={teamMembers}
        filters={filters}
      />
    </div>
  );
}
