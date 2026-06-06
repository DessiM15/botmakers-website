// SPEC: SPEC-PAGES > /admin/invoices — list with summary cards
// DEP-MAP: Square Billing > UI
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { getInvoices, getInvoiceSummary } from "@/lib/db/queries/invoices";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  viewed: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-500",
};

export default async function InvoicesPage() {
  const [invoiceRows, summary] = await Promise.all([
    getInvoices(),
    getInvoiceSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
          <Link href="/admin/invoices/new"><Plus className="h-4 w-4 mr-1" />New Invoice</Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex items-center gap-4 p-4">
            <DollarSign className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Outstanding</p>
              <p className="text-xl font-bold">${parseFloat(summary.outstanding.total).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{summary.outstanding.count} invoice{summary.outstanding.count !== 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-xs text-gray-400">Paid This Month</p>
              <p className="text-xl font-bold">${parseFloat(summary.paidThisMonth.total).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{summary.paidThisMonth.count} payment{summary.paidThisMonth.count !== 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Overdue</p>
              <p className="text-xl font-bold">${parseFloat(summary.overdue.total).toLocaleString()}</p>
              <p className="text-xs text-gray-500">{summary.overdue.count} invoice{summary.overdue.count !== 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices list */}
      {invoiceRows.length === 0 ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-lg font-medium text-gray-400">No invoices yet</p>
            <p className="text-sm text-gray-500 mb-4">Create your first invoice</p>
            <Button asChild className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90">
              <Link href="/admin/invoices/new"><Plus className="h-4 w-4 mr-1" />Create Invoice</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoiceRows.map((row) => (
            <Link
              key={row.invoice.id}
              href={`/admin/invoices/${row.invoice.id}`}
              className="block"
            >
              <Card className="border-white/10 bg-white/5 text-white hover:bg-white/10 transition cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium truncate">{row.invoice.title}</p>
                      <Badge className={STATUS_COLORS[row.invoice.status] ?? "bg-gray-500/20 text-gray-400"}>
                        {row.invoice.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{row.clientName}</span>
                      {row.projectName && <span className="text-gray-500">{row.projectName}</span>}
                      <span>{new Date(row.invoice.createdAt).toLocaleDateString()}</span>
                      {row.invoice.dueDate && (
                        <span className="text-gray-500">Due: {row.invoice.dueDate}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-lg font-bold ml-4">${parseFloat(row.invoice.amount).toLocaleString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
