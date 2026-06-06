// SPEC: SPEC-PAGES > /admin/invoices/[id] — Send, Payment Link, Mark Paid actions
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send, Link2, CheckCircle, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { sendViaSquare, generateCheckoutLink, markInvoicePaid } from "@/lib/actions/invoices";

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
  squarePaymentUrl: string | null;
}

export function InvoiceActions({ invoiceId, status, squarePaymentUrl }: InvoiceActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSendSquare() {
    setLoading("send");
    try {
      const result = await sendViaSquare(invoiceId);
      if (result.success) {
        toast.success("Invoice sent via Square!");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Failed to send via Square");
      }
    } catch {
      toast.error("Failed to send via Square");
    } finally {
      setLoading(null);
    }
  }

  async function handleCheckoutLink() {
    setLoading("link");
    try {
      const result = await generateCheckoutLink(invoiceId);
      if (result.success && result.checkoutUrl) {
        await navigator.clipboard.writeText(result.checkoutUrl);
        toast.success("Payment link copied to clipboard!");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Failed to generate link");
      }
    } catch {
      toast.error("Failed to generate checkout link");
    } finally {
      setLoading(null);
    }
  }

  async function handleMarkPaid() {
    setLoading("paid");
    try {
      const result = await markInvoicePaid(invoiceId);
      if (result.success) {
        toast.success("Invoice marked as paid!");
        router.refresh();
      } else {
        toast.error(result.error?.message ?? "Failed to mark as paid");
      }
    } catch {
      toast.error("Failed to mark as paid");
    } finally {
      setLoading(null);
    }
  }

  async function handleCopyUrl() {
    if (squarePaymentUrl) {
      await navigator.clipboard.writeText(squarePaymentUrl);
      toast.success("Payment URL copied!");
    }
  }

  const isPaid = status === "paid";
  const isCancelled = status === "cancelled";

  if (isPaid || isCancelled) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && (
        <Button
          onClick={handleSendSquare}
          disabled={!!loading}
          className="bg-[#03FF00] text-[#033457] hover:bg-[#03FF00]/90"
        >
          {loading === "send" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
          Send via Square
        </Button>
      )}
      <Button
        onClick={handleCheckoutLink}
        disabled={!!loading}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        {loading === "link" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Link2 className="h-4 w-4 mr-1" />}
        Generate Payment Link
      </Button>
      {squarePaymentUrl && (
        <Button
          onClick={handleCopyUrl}
          size="sm"
          variant="ghost"
          className="text-gray-400 hover:text-white"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy URL
        </Button>
      )}
      <Button
        onClick={handleMarkPaid}
        disabled={!!loading}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        {loading === "paid" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
        Mark as Paid
      </Button>
    </div>
  );
}
