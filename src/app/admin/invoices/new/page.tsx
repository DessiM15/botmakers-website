// SPEC: SPEC-PAGES > /admin/invoices/new — form with line items
// DEP-MAP: Square Billing > UI
import { InvoiceForm } from "@/components/admin/invoice-form";
import { db } from "@/lib/db/client";
import { clients, projects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function NewInvoicePage() {
  const [allClients, allProjects] = await Promise.all([
    db
      .select({ id: clients.id, fullName: clients.fullName, email: clients.email })
      .from(clients)
      .orderBy(desc(clients.createdAt))
      .limit(100),
    db
      .select({ id: projects.id, name: projects.name, clientId: projects.clientId })
      .from(projects)
      .orderBy(desc(projects.createdAt))
      .limit(100),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Invoice</h1>
      <InvoiceForm clients={allClients} projects={allProjects} />
    </div>
  );
}
