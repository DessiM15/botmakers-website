"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";

export default function PortalHomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/projects")
      .then((r) => r.json())
      .then((data) => {
        const list = data.projects || [];
        setProjects(list);
        // If single project, redirect directly
        if (list.length === 1) {
          router.push(`/portal/projects/${list[0].id}`);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-[#033457] mb-2">
          No Active Projects
        </h2>
        <p className="text-gray-500">
          Contact{" "}
          <a
            href="mailto:info@botmakers.ai"
            className="text-[#033457] hover:underline"
          >
            info@botmakers.ai
          </a>{" "}
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#033457] mb-6">Your Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/portal/projects/${project.id}`}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#033457]">{project.name}</h3>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  project.status === "completed"
                    ? "bg-green-50 text-green-600"
                    : project.status === "in_progress"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {project.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4">{project.project_type}</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#03FF00] rounded-full transition-all"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[#033457]">
                {project.progress || 0}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
