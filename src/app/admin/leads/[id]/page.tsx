// SPEC: SPEC-PAGES > /admin/leads/[id] — Lead detail
// DEP-MAP: Lead Management > UI > lead detail
import { notFound } from "next/navigation";
import { getLeadById, getContactsForLead, getTeamMembers } from "@/lib/db/queries/leads";
import { getUpcomingEventsForLead } from "@/lib/db/queries/calendar";
import { PIPELINE_STAGE_LABELS } from "@/lib/types/constants";
import { LeadDetail } from "@/components/admin/lead-detail";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;

  const [lead, contacts, teamMembers, upcomingEvents] = await Promise.all([
    getLeadById(id),
    getContactsForLead(id),
    getTeamMembers(),
    getUpcomingEventsForLead(id),
  ]);

  if (!lead) notFound();

  return (
    <LeadDetail
      lead={lead}
      contacts={contacts}
      teamMembers={teamMembers}
      stageLabels={PIPELINE_STAGE_LABELS}
      hasUpcomingEvent={upcomingEvents.length > 0}
    />
  );
}
