"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import type { Project } from "@/lib/types";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const statusColors: Record<string, string> = {
  draft: "bg-white/10 text-white/50",
  in_progress: "bg-blue-500/10 text-blue-400",
  paused: "bg-yellow-500/10 text-yellow-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-white/50 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 bg-[#03FF00] text-[#033457] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#02dd00] transition-colors"
        >
          <Plus size={16} />
          Create Project
        </Link>
      </div>

      {loading ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
          <div className="h-5 bg-white/10 rounded w-48 mb-4" />
          <div className="h-4 bg-white/5 rounded w-full mb-2" />
          <div className="h-4 bg-white/5 rounded w-full mb-2" />
          <div className="h-4 bg-white/5 rounded w-3/4" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <FolderKanban className="mx-auto mb-3 text-white/20" size={32} />
          <p className="text-white/40 mb-4">No projects yet.</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-[#03FF00] text-[#033457] px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-[#02dd00] transition-colors"
          >
            <Plus size={16} />
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left p-4">Project</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Phase</th>
                  <th className="text-left p-4">Progress</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-white font-medium hover:text-[#03FF00] transition-colors"
                      >
                        {project.name}
                      </Link>
                      <p className="text-white/30 text-xs mt-0.5">
                        {project.project_type}
                      </p>
                    </td>
                    <td className="p-4 text-white/60">
                      <div>{project.client_name}</div>
                      <div className="text-white/30 text-xs">
                        {project.client_email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          statusColors[project.status] || statusColors.draft
                        }`}
                      >
                        {project.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-white/60 text-xs">
                      {project.current_phase || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#03FF00] rounded-full transition-all"
                            style={{
                              width: `${project.progress || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-white/40">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-white/40 text-xs">
                      {relativeTime(project.created_at)}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-xs text-white/40 hover:text-[#03FF00] transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="block p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{project.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      statusColors[project.status] || statusColors.draft
                    }`}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-white/40 text-xs mb-2">
                  {project.client_name} · {project.current_phase || "No phase"}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#03FF00] rounded-full"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">
                    {project.progress || 0}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
