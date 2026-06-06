// SPEC: SPEC-PAGES > /admin/pipeline — Kanban board
// DEP-MAP: Pipeline Board > UI > 10-column Kanban board
import { getLeadsByStage } from "@/lib/db/queries/leads";
import { getTeamMembers } from "@/lib/db/queries/leads";
import { DEFAULT_PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from "@/lib/types/constants";
import { PipelineBoard } from "@/components/admin/pipeline-board";

export default async function PipelinePage() {
  const [leadsByStage, teamMembers] = await Promise.all([
    getLeadsByStage(),
    getTeamMembers(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pipeline</h1>
      <PipelineBoard
        leadsByStage={leadsByStage}
        stages={[...DEFAULT_PIPELINE_STAGES]}
        stageLabels={PIPELINE_STAGE_LABELS}
        teamMembers={teamMembers}
      />
    </div>
  );
}
