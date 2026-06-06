// SPEC: SPEC-PAGES > /admin/clients — Client list
// DEP-MAP: Client Management > UI > /admin/clients
import { getClients } from "@/lib/db/queries/clients";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No clients yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Convert a lead to create your first client
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Company</TableHead>
                <TableHead className="text-gray-400">Projects</TableHead>
                <TableHead className="text-gray-400">Open Invoices</TableHead>
                <TableHead className="text-gray-400">Last Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-medium text-white hover:text-[#03FF00] transition-colors"
                    >
                      {client.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-300 text-sm">{client.email}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{client.company ?? "—"}</TableCell>
                  <TableCell className="text-gray-300 text-sm">{client.projectCount}</TableCell>
                  <TableCell className="text-gray-300 text-sm">
                    {client.openInvoiceTotal > 0
                      ? `$${client.openInvoiceTotal.toLocaleString()}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {client.lastContactedAt
                      ? new Date(client.lastContactedAt).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
