// SPEC: SPEC-PAGES > /admin/projects/[id] — Tabbed detail
// DEP-MAP: Project Management > UI > tabbed detail
import { notFound } from "next/navigation";
import {
  getProjectById,
  getReposForProject,
  getDemosForProject,
  getQuestionsForProject,
  getInvoicesForProject,
  getClientForProject,
} from "@/lib/db/queries/projects";
import { ProjectDetail } from "@/components/admin/project-detail";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  const project = await getProjectById(id);
  if (!project) notFound();

  const [client, repos, demos, questions, invoices] = await Promise.all([
    getClientForProject(project.clientId),
    getReposForProject(id),
    getDemosForProject(id),
    getQuestionsForProject(id),
    getInvoicesForProject(id),
  ]);

  return (
    <ProjectDetail
      project={project}
      client={client}
      repos={repos}
      demos={demos}
      questions={questions}
      invoices={invoices}
    />
  );
}
