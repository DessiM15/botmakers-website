// SPEC: SPEC-PAGES > /admin/projects — Project cards with progress
// DEP-MAP: Project Management > UI > /admin/projects
import { getProjects } from "@/lib/db/queries/projects";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  in_progress: "bg-green-500/20 text-green-400",
  paused: "bg-yellow-500/20 text-yellow-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/admin/projects/new">
          <Button className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90 font-semibold">
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No projects yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/admin/projects/${project.id}`}>
              <Card className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      {project.projectType && (
                        <p className="text-xs text-gray-500 mt-0.5">{project.projectType}</p>
                      )}
                    </div>
                    <Badge className={`text-[10px] ${STATUS_STYLES[project.status] ?? STATUS_STYLES.draft}`}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                    <div
                      className="bg-[#03FF00] h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {project.completedMilestones}/{project.totalMilestones} milestones
                    </p>
                    <p className="text-xs font-medium text-[#03FF00]">
                      {project.progress}%
                    </p>
                  </div>

                  {parseFloat(project.totalValue) > 0 && (
                    <p className="text-sm text-gray-300 mt-3">
                      ${parseFloat(project.totalValue).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
