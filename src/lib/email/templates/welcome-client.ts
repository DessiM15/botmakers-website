// SPEC: SPEC-WORKFLOWS > Workflow 4 > Step 5: Welcome email
// DEP-MAP: Notification System > welcomeClient

interface WelcomeClientData {
  fullName: string;
}

export function welcomeClient(data: WelcomeClientData): { subject: string; html: string } {
  const firstName = data.fullName.split(" ")[0];
  return {
    subject: "Welcome to Botmakers — Your Client Portal is Ready",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">Welcome to Botmakers</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:16px;color:#18181b">Hi ${firstName},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46">Welcome aboard! Your client portal is now active. You can use it to:</p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:#3f3f46">
      <li>Track your project progress in real-time</li>
      <li>View and approve demos</li>
      <li>Review proposals and invoices</li>
      <li>Ask questions directly to the team</li>
    </ul>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#3f3f46">To access your portal, simply click the button below. We use magic links — no password needed!</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://botmakers.ai"}/portal/login" style="display:inline-block;padding:12px 32px;background:#03FF00;color:#033457;font-weight:700;text-decoration:none;border-radius:6px;font-size:14px">Access Your Portal</a>
    </div>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#71717a">We're excited to work with you!</p>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
