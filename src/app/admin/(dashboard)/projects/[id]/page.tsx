"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MilestoneEditor from "@/components/admin/MilestoneEditor";
import DemoLinkForm from "@/components/admin/DemoLinkForm";
import QuestionReply from "@/components/admin/QuestionReply";
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

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "in_progress", label: "In Progress" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "milestones", label: "Milestones" },
  { id: "demos", label: "Demos" },
  { id: "questions", label: "Questions" },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setStatus(data.status);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-white/10 rounded w-32 mb-6" />
        <div className="h-8 bg-white/10 rounded w-64 mb-8" />
        <div className="h-64 bg-white/5 border border-white/10 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">Project not found.</p>
        <Link href="/admin/projects" className="text-[#03FF00] text-sm mt-2 inline-block">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const totalMilestones = project.phases?.reduce(
    (sum, p) => sum + (p.milestones?.length || 0),
    0
  ) || 0;
  const completedMilestones = project.phases?.reduce(
    (sum, p) =>
      sum + (p.milestones?.filter((m) => m.status === "completed").length || 0),
    0
  ) || 0;
  const progress =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  return (
    <div>
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          <p className="text-white/50 text-sm mt-1">
            {project.client_name} · {project.project_type}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#03FF00] transition-colors w-fit"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Progress bar */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Overall Progress</span>
          <span className="text-sm font-bold text-[#03FF00]">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#03FF00] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/40 mt-2">
          {completedMilestones} of {totalMilestones} milestones completed
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "text-[#03FF00] border-[#03FF00]"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            {tab.label}
            {tab.id === "questions" && project.questions?.length > 0 && (
              <span className="ml-1.5 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">
                {project.questions.filter((q) => !q.reply_text).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
              Project Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Type</span>
                <span className="text-white">{project.project_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Status</span>
                <span className="text-white capitalize">
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Created</span>
                <span className="text-white">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              {project.description && (
                <div className="pt-3 border-t border-white/5">
                  <span className="text-white/40 block mb-1">Description</span>
                  <p className="text-white/70">{project.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">
              Client Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Name</span>
                <span className="text-white">{project.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Email</span>
                <span className="text-white">{project.client_email}</span>
              </div>
              {project.client_company && (
                <div className="flex justify-between">
                  <span className="text-white/40">Company</span>
                  <span className="text-white">{project.client_company}</span>
                </div>
              )}
              {project.client_phone && (
                <div className="flex justify-between">
                  <span className="text-white/40">Phone</span>
                  <span className="text-white">{project.client_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "milestones" && (
        <MilestoneEditor
          projectId={project.id}
          phases={project.phases || []}
          onUpdate={() => {
            // Refresh project data
            fetch(`/api/admin/projects/${id}`)
              .then((r) => r.json())
              .then(setProject);
          }}
        />
      )}

      {activeTab === "demos" && (
        <DemoLinkForm
          projectId={project.id}
          demos={project.demos || []}
          phases={project.phases || []}
          onUpdate={() => {
            fetch(`/api/admin/projects/${id}`)
              .then((r) => r.json())
              .then(setProject);
          }}
        />
      )}

      {activeTab === "questions" && (
        <QuestionReply
          projectId={project.id}
          questions={project.questions || []}
          onUpdate={() => {
            fetch(`/api/admin/projects/${id}`)
              .then((r) => r.json())
              .then(setProject);
          }}
        />
      )}
    </div>
  );
}
