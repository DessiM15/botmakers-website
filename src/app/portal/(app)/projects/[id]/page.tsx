"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProgressBar from "@/components/portal/ProgressBar";
import MilestoneChecklist from "@/components/portal/MilestoneChecklist";
import DemoGallery from "@/components/portal/DemoGallery";
import QuestionForm from "@/components/portal/QuestionForm";
import type {
  Project,
  ProjectPhase,
  ProjectDemo,
  ProjectQuestion,
} from "@/lib/types";

interface ProjectDetail extends Project {
  phases: ProjectPhase[];
  demos: ProjectDemo[];
  questions: ProjectQuestion[];
}

const statusLabels: Record<string, { text: string; color: string }> = {
  draft: { text: "Draft", color: "bg-gray-100 text-gray-500" },
  in_progress: { text: "In Progress", color: "bg-blue-50 text-blue-600" },
  paused: { text: "Paused", color: "bg-yellow-50 text-yellow-600" },
  completed: { text: "Completed", color: "bg-green-50 text-green-600" },
  cancelled: { text: "Cancelled", color: "bg-red-50 text-red-600" },
};

export default function PortalProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = () => {
    fetch(`/api/portal/projects/${id}`)
      .then((r) => r.json())
      .then(setProject)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  const phases = project.phases || [];
  const totalMilestones = phases.reduce(
    (sum, p) => sum + (p.milestones?.length || 0),
    0
  );
  const completedMilestones = phases.reduce(
    (sum, p) =>
      sum + (p.milestones?.filter((m) => m.status === "completed").length || 0),
    0
  );
  const progress =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  // Find current phase (first with incomplete milestones)
  const currentPhaseIdx = phases.findIndex(
    (p) => p.milestones?.some((m) => m.status !== "completed")
  );
  const currentPhase =
    currentPhaseIdx >= 0 ? phases[currentPhaseIdx].name : "Complete";

  const statusInfo = statusLabels[project.status] || statusLabels.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#033457]">{project.name}</h1>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </div>
        <p className="text-gray-500 text-sm">{project.project_type}</p>
      </div>

      {/* Progress */}
      <ProgressBar
        progress={progress}
        currentPhase={currentPhase}
        totalPhases={phases.length}
        currentPhaseIndex={currentPhaseIdx >= 0 ? currentPhaseIdx : phases.length - 1}
      />

      {/* Milestones */}
      <MilestoneChecklist phases={phases} />

      {/* Demos */}
      <DemoGallery demos={project.demos || []} />

      {/* Questions */}
      <QuestionForm
        projectId={project.id}
        questions={project.questions || []}
        onSubmit={fetchProject}
      />
    </div>
  );
}
