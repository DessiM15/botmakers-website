"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Check, Loader2 } from "lucide-react";
import type { ProjectPhase } from "@/lib/types";

interface Props {
  phases: ProjectPhase[];
}

export default function MilestoneChecklist({ phases }: Props) {
  // Determine current phase (first phase with incomplete milestones)
  const currentPhaseIdx = phases.findIndex(
    (p) => p.milestones?.some((m) => m.status !== "completed")
  );

  const [expanded, setExpanded] = useState<Set<number>>(() => {
    const set = new Set<number>();
    if (currentPhaseIdx >= 0) set.add(currentPhaseIdx);
    // Also expand previous phase if there is one
    if (currentPhaseIdx > 0) set.add(currentPhaseIdx - 1);
    return set;
  });

  const toggleExpand = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-[#033457]">Milestones</h2>
      </div>

      {phases.map((phase, phaseIdx) => {
        const milestones = phase.milestones || [];
        const completed = milestones.filter(
          (m) => m.status === "completed"
        ).length;
        const allComplete = completed === milestones.length && milestones.length > 0;
        const isCurrent = phaseIdx === currentPhaseIdx;
        const isFuture = phaseIdx > currentPhaseIdx && currentPhaseIdx >= 0;

        return (
          <div
            key={phase.id}
            className={`border-b border-gray-100 last:border-b-0 ${
              isFuture ? "opacity-40" : ""
            }`}
          >
            <button
              onClick={() => toggleExpand(phaseIdx)}
              className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-400">
                {expanded.has(phaseIdx) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
              <span
                className={`font-medium flex-1 ${
                  isCurrent
                    ? "text-[#033457]"
                    : allComplete
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {phase.name}
              </span>
              <span className="text-xs text-gray-400">
                {completed}/{milestones.length}
              </span>
              {allComplete && <Check size={14} className="text-green-500" />}
              {isCurrent && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </button>

            {expanded.has(phaseIdx) && (
              <div className="px-6 pb-4">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 py-2"
                  >
                    {milestone.status === "completed" ? (
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-green-600" />
                      </div>
                    ) : milestone.status === "in_progress" ? (
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Loader2
                          size={12}
                          className="text-blue-600 animate-spin"
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                    )}
                    <span
                      className={`text-sm flex-1 ${
                        milestone.status === "completed"
                          ? "text-gray-400 line-through"
                          : milestone.status === "in_progress"
                          ? "text-[#033457] font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {milestone.title}
                    </span>
                    {milestone.completed_at && (
                      <span className="text-xs text-gray-300">
                        {new Date(milestone.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
