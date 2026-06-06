// SPEC: SPEC-PAGES > /portal/invoices/[id] — Client Invoice Detail
// DEP-MAP: Square Billing > UI > /portal/invoices/[id]
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/auth/helpers";
import { getInvoiceById } from "@/lib/db/queries/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
} from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-purple-100 text-purple-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default async function PortalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await requireClient();
  const data = await getInvoiceById(id);

  if (!data || data.invoice.clientId !== client.id) {
    notFound();
  }

  const { invoice, lineItems, payments: paymentsList } = data;
  const isPaid = invoice.status === "paid";
  const canPay =
    !isPaid &&
    invoice.status !== "draft" &&
    invoice.status !== "cancelled";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/portal/invoices"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-[#033457]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#033457]">
            {invoice.title}
          </h1>
          {invoice.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {invoice.description}
            </p>
          )}
        </div>
        <Badge
          variant="secondary"
          className={statusColors[invoice.status] ?? ""}
        >
          {invoice.status}
        </Badge>
      </div>

      {/* Invoice Info */}
      <Card>
        <CardContent className="py-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-bold text-[#033457]">
                $
                {Number(invoice.amount).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="font-medium">
                {invoice.dueDate
                  ? new Date(invoice.dueDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{invoice.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[#033457]">
              Line Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {Number(item.quantity)}
                      </TableCell>
                      <TableCell className="text-right">
                        $
                        {Number(item.unitPrice).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        $
                        {Number(item.total).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      $
                      {Number(invoice.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Payment Section */}
      {isPaid ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-3 py-6">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                Paid on{" "}
                {invoice.paidAt
                  ? new Date(invoice.paidAt).toLocaleDateString()
                  : ""}
              </p>
              {paymentsList.length > 0 && (
                <p className="text-sm text-green-700">
                  Payment of $
                  {Number(paymentsList[0].amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  received
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : canPay && invoice.squarePaymentUrl ? (
        <Card>
          <CardContent className="py-6 text-center">
            <a
              href={invoice.squarePaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Pay Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              You will be redirected to Square for secure payment processing.
            </p>
          </CardContent>
        </Card>
      ) : canPay ? (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Payment link is being prepared. Please check back shortly or
              contact{" "}
              <a
                href="mailto:info@botmakers.ai"
                className="text-[#1E40AF] underline"
              >
                info@botmakers.ai
              </a>
              .
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
