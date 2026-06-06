// SPEC: SPEC-PAGES > /admin/projects/new — Create project form
// DEP-MAP: Project Management > UI > creation form with phase template
import { getClients } from "@/lib/db/queries/clients";
import { ProjectCreateForm } from "@/components/admin/project-create-form";

export default async function NewProjectPage() {
  const clients = await getClients();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">New Project</h1>
      <ProjectCreateForm clients={clients} />
    </div>
  );
}
