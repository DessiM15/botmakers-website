// SPEC: SPEC-DEPENDENCY-MAP > Pipeline Board > UI
// DEP-MAP: Pipeline Board > drag-and-drop, filter bar, lead cards
"use client";

import { useState, useTransition } from "react";
import { updateLeadStage } from "@/lib/actions/leads";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import type { TeamUser } from "@/lib/types";

interface PipelineBoardProps {
  leadsByStage: Record<string, Lead[]>;
  stages: string[];
  stageLabels: Record<string, string>;
  teamMembers: TeamUser[];
}

const STAGE_COLORS: Record<string, string> = {
  new_lead: "#03FF00",
  contacted: "#22D3EE",
  discovery_scheduled: "#818CF8",
  discovery_completed: "#A78BFA",
  proposal_sent: "#F59E0B",
  negotiation: "#FB923C",
  contract_signed: "#34D399",
  active_client: "#10B981",
  project_delivered: "#06B6D4",
  retention: "#8B5CF6",
};

const SCORE_COLORS: Record<string, string> = {
  high: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  low: "bg-red-500/20 text-red-400",
};

const SOURCE_COLORS: Record<string, string> = {
  web_form: "bg-blue-500/20 text-blue-400",
  referral: "bg-purple-500/20 text-purple-400",
  vapi: "bg-cyan-500/20 text-cyan-400",
  cold_outreach: "bg-orange-500/20 text-orange-400",
  word_of_mouth: "bg-indigo-500/20 text-indigo-400",
  other: "bg-gray-500/20 text-gray-400",
};

function daysInStage(changedAt: Date | string): number {
  const changed = new Date(changedAt);
  const now = new Date();
  return Math.floor((now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24));
}

export function PipelineBoard({
  leadsByStage,
  stages,
  stageLabels,
}: PipelineBoardProps) {
  const [localLeads, setLocalLeads] = useState(leadsByStage);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDragStart(lead: Lead) {
    setDraggedLead(lead);
  }

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDragLeave() {
    setDragOverStage(null);
  }

  function handleDrop(targetStage: string) {
    if (!draggedLead || draggedLead.pipelineStage === targetStage) {
      setDraggedLead(null);
      setDragOverStage(null);
      return;
    }

    const sourceStage = draggedLead.pipelineStage;
    const lead = draggedLead;

    // Optimistic update
    setLocalLeads((prev) => {
      const next = { ...prev };
      next[sourceStage] = (next[sourceStage] ?? []).filter((l) => l.id !== lead.id);
      const movedLead = { ...lead, pipelineStage: targetStage as Lead["pipelineStage"] };
      next[targetStage] = [movedLead, ...(next[targetStage] ?? [])];
      return next;
    });

    setDraggedLead(null);
    setDragOverStage(null);

    startTransition(async () => {
      const result = await updateLeadStage(lead.id, targetStage as Lead["pipelineStage"]);
      if (!result.success) {
        // Revert on error
        setLocalLeads((prev) => {
          const next = { ...prev };
          next[targetStage] = (next[targetStage] ?? []).filter((l) => l.id !== lead.id);
          next[sourceStage] = [lead, ...(next[sourceStage] ?? [])];
          return next;
        });
        toast.error(result.error?.message ?? "Failed to move lead");
      }
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6">
      {stages.map((stage) => {
        const stageLeads = localLeads[stage] ?? [];
        const isOver = dragOverStage === stage;

        return (
          <div
            key={stage}
            className={`min-w-[260px] max-w-[260px] flex flex-col rounded-lg bg-white/5 ${
              isOver ? "ring-2 ring-[#03FF00]/50" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(stage)}
          >
            {/* Column header */}
            <div className="p-3 border-b border-white/10">
              <div
                className="h-1 rounded-full mb-2"
                style={{ backgroundColor: STAGE_COLORS[stage] ?? "#666" }}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  {stageLabels[stage] ?? stage}
                </span>
                <Badge variant="secondary" className="text-[10px] bg-white/10 text-gray-400">
                  {stageLeads.length}
                </Badge>
              </div>
            </div>

            {/* Lead cards */}
            <div className="flex-1 p-2 space-y-2 min-h-[200px]">
              {stageLeads.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">
                  No leads in this stage
                </p>
              ) : (
                stageLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    draggable
                    onDragStart={() => handleDragStart(lead)}
                    className={`block p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing border border-white/5 ${
                      draggedLead?.id === lead.id ? "opacity-50" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-white truncate">
                      {lead.fullName}
                    </p>
                    {lead.companyName && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lead.companyName}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {lead.source && (
                        <Badge className={`text-[10px] ${SOURCE_COLORS[lead.source] ?? SOURCE_COLORS.other}`}>
                          {lead.source.replace("_", " ")}
                        </Badge>
                      )}
                      {lead.score && (
                        <Badge className={`text-[10px] ${SCORE_COLORS[lead.score] ?? ""}`}>
                          {lead.score}
                        </Badge>
                      )}
                      <span className="text-[10px] text-gray-500 ml-auto">
                        {daysInStage(lead.pipelineStageChangedAt)}d
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
