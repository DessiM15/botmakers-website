// SPEC: SPEC-WORKFLOWS > Workflow 9 > Step 8: Payment confirmation to client
// DEP-MAP: Notification System > paymentConfirmation

interface PaymentConfirmationData {
  clientName: string;
  invoiceTitle: string;
  amount: string;
}

export function paymentConfirmation(data: PaymentConfirmationData): { subject: string; html: string } {
  const firstName = data.clientName.split(" ")[0];
  const amount = parseFloat(data.amount).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return {
    subject: `Payment Confirmed — $${amount}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">Payment Confirmed</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:16px;color:#18181b">Hi ${firstName},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46">We've received your payment. Thank you!</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:0 0 20px">
      <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#166534">$${amount}</p>
      <p style="margin:0;font-size:14px;color:#3f3f46">Invoice: ${data.invoiceTitle}</p>
    </div>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#3f3f46">You can view your invoice history in your client portal.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://botmakers.ai"}/portal/login" style="display:inline-block;padding:12px 32px;background:#03FF00;color:#033457;font-weight:700;text-decoration:none;border-radius:6px;font-size:14px">View Portal</a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
