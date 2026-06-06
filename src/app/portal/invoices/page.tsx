// SPEC: SPEC-PAGES > /portal/invoices — Client Invoice List
// DEP-MAP: Square Billing > UI > /portal/invoices
import Link from "next/link";
import { requireClient } from "@/lib/auth/helpers";
import { getInvoices } from "@/lib/db/queries/invoices";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt, ArrowRight } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function PortalInvoicesPage() {
  const client = await requireClient();
  const invoiceRows = await getInvoices({ clientId: client.id });

  // Only show non-draft invoices to clients
  const visibleInvoices = invoiceRows.filter(
    (r) => r.invoice.status !== "draft"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#033457]">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          View and pay your invoices.
        </p>
      </div>

      {visibleInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-4 text-lg font-semibold text-[#033457]">
              No invoices yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your invoices will appear here once they are sent.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 sm:hidden">
            {visibleInvoices.map((row) => (
              <Link
                key={row.invoice.id}
                href={`/portal/invoices/${row.invoice.id}`}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{row.invoice.title}</p>
                        <p className="text-sm text-muted-foreground">
                          $
                          {Number(row.invoice.amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusColors[row.invoice.status] ?? ""}
                      >
                        {row.invoice.status}
                      </Badge>
                    </div>
                    {row.invoice.dueDate && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Due{" "}
                        {new Date(row.invoice.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {row.invoice.paidAt && (
                      <p className="mt-2 text-xs text-green-600">
                        Paid{" "}
                        {new Date(row.invoice.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden sm:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleInvoices.map((row) => (
                    <TableRow key={row.invoice.id}>
                      <TableCell className="font-medium">
                        {row.invoice.title}
                      </TableCell>
                      <TableCell className="text-right">
                        $
                        {Number(row.invoice.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[row.invoice.status] ?? ""}
                        >
                          {row.invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.invoice.dueDate
                          ? new Date(
                              row.invoice.dueDate
                            ).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {row.invoice.paidAt
                          ? new Date(row.invoice.paidAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="ghost">
                          <Link
                            href={`/portal/invoices/${row.invoice.id}`}
                          >
                            View
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
