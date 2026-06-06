// SPEC: SPEC-PAGES > /admin/invoices/[id] — detail with Square sync + payment history
// DEP-MAP: Square Billing > UI
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getInvoiceById } from "@/lib/db/queries/invoices";
import { InvoiceActions } from "@/components/admin/invoice-actions";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  viewed: "bg-yellow-500/20 text-yellow-400",
  paid: "bg-green-500/20 text-green-400",
  overdue: "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-500",
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getInvoiceById(id);

  if (!data) return notFound();

  const { invoice, lineItems, payments: paymentHistory, clientName, clientEmail, projectName, createdByName } = data;
  const total = parseFloat(invoice.amount);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
          <Link href="/admin/invoices"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1 truncate">{invoice.title}</h1>
        <Badge className={STATUS_COLORS[invoice.status] ?? ""}>
          {invoice.status}
        </Badge>
      </div>

      {/* Actions */}
      <InvoiceActions
        invoiceId={id}
        status={invoice.status}
        squarePaymentUrl={invoice.squarePaymentUrl}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                    <p className="text-gray-300">{item.description}</p>
                    <div className="text-right">
                      <p>{parseFloat(item.quantity)} x ${parseFloat(item.unitPrice).toLocaleString()}</p>
                      <p className="font-medium">${parseFloat(item.total).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-white/10 text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-400">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm p-3 bg-green-500/5 rounded-lg">
                      <div>
                        <p className="font-medium text-green-400">${parseFloat(payment.amount).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{payment.method.replace(/_/g, " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400">{new Date(payment.paidAt).toLocaleDateString()}</p>
                        {payment.squarePaymentId && (
                          <p className="text-xs text-gray-500">Square: {payment.squarePaymentId.substring(0, 8)}...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Client</p>
                <p>{clientName}</p>
                <p className="text-gray-400">{clientEmail}</p>
              </div>
              {projectName && (
                <div>
                  <p className="text-gray-500">Project</p>
                  <p>{projectName}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Created By</p>
                <p>{createdByName}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(invoice.createdAt).toLocaleDateString()}</p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-gray-500">Due Date</p>
                  <p>{invoice.dueDate}</p>
                </div>
              )}
              {invoice.sentAt && (
                <div>
                  <p className="text-gray-500">Sent</p>
                  <p>{new Date(invoice.sentAt).toLocaleDateString()}</p>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <p className="text-gray-500">Paid</p>
                  <p>{new Date(invoice.paidAt).toLocaleDateString()}</p>
                </div>
              )}
              {invoice.squareInvoiceId && (
                <div>
                  <p className="text-gray-500">Square Invoice ID</p>
                  <p className="font-mono text-xs">{invoice.squareInvoiceId}</p>
                </div>
              )}
              {invoice.squarePaymentUrl && (
                <div>
                  <p className="text-gray-500">Payment URL</p>
                  <a
                    href={invoice.squarePaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#03FF00] hover:underline flex items-center gap-1 text-xs"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {invoice.description && (
                <div>
                  <p className="text-gray-500">Description</p>
                  <p className="text-gray-300">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
