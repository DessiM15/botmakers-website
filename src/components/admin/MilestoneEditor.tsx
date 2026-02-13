"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import type { ProjectPhase, MilestoneStatus } from "@/lib/types";

interface Props {
  projectId: string;
  phases: ProjectPhase[];
  onUpdate: () => void;
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Pending", color: "text-white/40", bg: "bg-white/10" },
  in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
};

export default function MilestoneEditor({ projectId, phases, onUpdate }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(phases.map((p) => p.id))
  );
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState<Record<string, string>>({});
  const [newPhaseName, setNewPhaseName] = useState("");
  const [showAddPhase, setShowAddPhase] = useState(false);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (
    milestoneId: string,
    newStatus: MilestoneStatus
  ) => {
    if (newStatus === "completed" && confirmComplete !== milestoneId) {
      setConfirmComplete(milestoneId);
      return;
    }
    setConfirmComplete(null);
    setUpdating(milestoneId);
    await fetch(
      `/api/admin/projects/${projectId}/milestones/${milestoneId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    setUpdating(null);
    onUpdate();
  };

  const handleAddMilestone = async (phaseId: string) => {
    const title = newMilestone[phaseId]?.trim();
    if (!title) return;
    await fetch(`/api/admin/projects/${projectId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase_id: phaseId, title }),
    });
    setNewMilestone((prev) => ({ ...prev, [phaseId]: "" }));
    onUpdate();
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    await fetch(
      `/api/admin/projects/${projectId}/milestones/${milestoneId}`,
      { method: "DELETE" }
    );
    onUpdate();
  };

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) return;
    await fetch(`/api/admin/projects/${projectId}/phases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newPhaseName.trim() }),
    });
    setNewPhaseName("");
    setShowAddPhase(false);
    onUpdate();
  };

  const handleReorder = async (
    milestoneId: string,
    direction: "up" | "down"
  ) => {
    await fetch(
      `/api/admin/projects/${projectId}/milestones/${milestoneId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: direction }),
      }
    );
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {phases.map((phase) => {
        const phaseComplete =
          phase.milestones?.every((m) => m.status === "completed") ?? false;
        const phaseMilestones = phase.milestones || [];

        return (
          <div
            key={phase.id}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
          >
            {/* Phase header */}
            <button
              onClick={() => toggleExpand(phase.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
            >
              <span className="text-white/40">
                {expanded.has(phase.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
              <span className="font-medium text-white flex-1">
                {phase.name}
              </span>
              <span className="text-xs text-white/40">
                {phaseMilestones.filter((m) => m.status === "completed").length}/
                {phaseMilestones.length}
              </span>
              {phaseComplete && phaseMilestones.length > 0 && (
                <Check size={14} className="text-[#03FF00]" />
              )}
            </button>

            {/* Milestones */}
            {expanded.has(phase.id) && (
              <div className="border-t border-white/5">
                {phaseMilestones.map((milestone, idx) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-b-0 group"
                  >
                    {/* Status icon */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        statusConfig[milestone.status].bg
                      }`}
                    >
                      {milestone.status === "completed" ? (
                        <Check
                          size={12}
                          className={statusConfig[milestone.status].color}
                        />
                      ) : updating === milestone.id ? (
                        <Loader2
                          size={12}
                          className="animate-spin text-white/40"
                        />
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            milestone.status === "in_progress"
                              ? "bg-blue-400"
                              : "bg-white/20"
                          }`}
                        />
                      )}
                    </div>

                    {/* Title */}
                    <span
                      className={`flex-1 text-sm ${
                        milestone.status === "completed"
                          ? "text-white/40 line-through"
                          : "text-white/70"
                      }`}
                    >
                      {milestone.title}
                    </span>

                    {/* Confirm complete dialog */}
                    {confirmComplete === milestone.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-yellow-400">
                          Client will be notified.
                        </span>
                        <button
                          onClick={() =>
                            handleStatusChange(milestone.id, "completed")
                          }
                          className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded hover:bg-green-500/20 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmComplete(null)}
                          className="text-xs text-white/40 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Status dropdown */}
                        <select
                          value={milestone.status}
                          onChange={(e) =>
                            handleStatusChange(
                              milestone.id,
                              e.target.value as MilestoneStatus
                            )
                          }
                          className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs text-white/60 focus:outline-none focus:border-[#03FF00] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <option value="pending" className="bg-gray-900">
                            Pending
                          </option>
                          <option value="in_progress" className="bg-gray-900">
                            In Progress
                          </option>
                          <option value="completed" className="bg-gray-900">
                            Completed
                          </option>
                        </select>

                        {/* Reorder */}
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button
                              onClick={() =>
                                handleReorder(milestone.id, "up")
                              }
                              className="p-1 text-white/20 hover:text-white/60 transition-colors"
                            >
                              <ArrowUp size={12} />
                            </button>
                          )}
                          {idx < phaseMilestones.length - 1 && (
                            <button
                              onClick={() =>
                                handleReorder(milestone.id, "down")
                              }
                              className="p-1 text-white/20 hover:text-white/60 transition-colors"
                            >
                              <ArrowDown size={12} />
                            </button>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            handleDeleteMilestone(milestone.id)
                          }
                          className="p-1 text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {/* Add milestone */}
                <div className="px-4 py-3 flex gap-2">
                  <input
                    type="text"
                    value={newMilestone[phase.id] || ""}
                    onChange={(e) =>
                      setNewMilestone((prev) => ({
                        ...prev,
                        [phase.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddMilestone(phase.id)
                    }
                    placeholder="Add milestone..."
                    className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#03FF00] transition-colors"
                  />
                  <button
                    onClick={() => handleAddMilestone(phase.id)}
                    className="text-white/30 hover:text-[#03FF00] transition-colors p-1.5"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add phase */}
      {showAddPhase ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newPhaseName}
            onChange={(e) => setNewPhaseName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddPhase()}
            placeholder="Phase name..."
            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#03FF00] transition-colors"
            autoFocus
          />
          <button
            onClick={handleAddPhase}
            className="bg-[#03FF00] text-[#033457] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#02dd00] transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddPhase(false);
              setNewPhaseName("");
            }}
            className="text-white/40 hover:text-white text-sm px-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddPhase(true)}
          className="flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          <Plus size={14} />
          Add Phase
        </button>
      )}
    </div>
  );
}
