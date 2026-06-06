// SPEC: SPEC-WORKFLOWS > Workflow 2 > Step 5: Referred contact outreach email
// DEP-MAP: Referral > EMAIL > referredContactOutreach

interface ReferredContactOutreachData {
  contactName: string;
  contactEmail: string;
  referrerName: string;
}

export function referredContactOutreach(data: ReferredContactOutreachData): {
  subject: string;
  html: string;
} {
  const firstName = data.contactName.split(" ")[0];

  return {
    subject: `${data.referrerName} thought we should connect — Botmakers.ai`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;color:#03FF00;font-size:24px;font-weight:700">Botmakers.ai</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">AI-Accelerated Software Development</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <h2 style="margin:0 0 16px;font-size:20px;color:#18181b">Hi ${firstName},</h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46">
      <strong>${data.referrerName}</strong> thought you might benefit from our services and suggested we reach out.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46">
      At Botmakers, we help businesses build custom software using AI-accelerated development. That means faster delivery, smarter solutions, and better results.
    </p>
    <div style="margin:20px 0;padding:20px;background:#f0fdf4;border-radius:6px">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#18181b">What we do:</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:2;color:#3f3f46">
        <li>Custom web &amp; mobile applications</li>
        <li>AI integrations &amp; automation</li>
        <li>SaaS products &amp; internal tools</li>
        <li>Technical consulting &amp; architecture</li>
      </ul>
    </div>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#3f3f46">
      If you have a project in mind, we&apos;d love to chat. Just reply to this email or visit our website to tell us more about what you&apos;re working on.
    </p>
    <div style="text-align:center">
      <a href="https://botmakers.ai" style="display:inline-block;padding:12px 32px;background:#03FF00;color:#033457;font-weight:700;font-size:14px;text-decoration:none;border-radius:6px">Visit Botmakers.ai</a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0 0 4px;font-size:13px;color:#71717a">Botmakers Inc. — Katy, Texas</p>
    <p style="margin:0;font-size:12px;color:#a1a1aa"><a href="https://botmakers.ai" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
