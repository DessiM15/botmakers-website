// SPEC: SPEC-WORKFLOWS > Workflow 1 > Step 10: Prospect confirmation email
// DEP-MAP: Lead Management > EMAIL > prospectConfirmation

interface ProspectConfirmationData {
  fullName: string;
  aiSummary?: string | null;
}

export function prospectConfirmation(lead: ProspectConfirmationData): {
  subject: string;
  html: string;
} {
  const firstName = lead.fullName.split(" ")[0];

  return {
    subject: "Thanks for reaching out — Botmakers.ai",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;color:#03FF00;font-size:24px;font-weight:700">Botmakers.ai</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">AI-Accelerated Software Development</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <h2 style="margin:0 0 16px;font-size:20px;color:#18181b">Hey ${firstName},</h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46">
      Thanks for reaching out! We received your project inquiry and our team is reviewing it now.
    </p>
    ${lead.aiSummary ? `<div style="margin:20px 0;padding:20px;background:#f0fdf4;border-left:4px solid #03FF00;border-radius:0 6px 6px 0"><p style="margin:0 0 4px;font-size:12px;color:#166534;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Here&apos;s what we understand about your project</p><p style="margin:0;font-size:14px;line-height:1.6;color:#18181b">${lead.aiSummary}</p></div>` : ""}
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46">
      <strong>What happens next:</strong>
    </p>
    <ol style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:2;color:#3f3f46">
      <li>Our team reviews your project details</li>
      <li>We reach out to schedule a quick discovery call</li>
      <li>We prepare a tailored proposal for your review</li>
    </ol>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#3f3f46">
      We typically respond within 24 hours. In the meantime, feel free to reply to this email with any additional details.
    </p>
  </div>
  <div style="padding:20px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0 0 4px;font-size:13px;color:#71717a">Botmakers Inc. — Katy, Texas</p>
    <p style="margin:0;font-size:12px;color:#a1a1aa"><a href="https://botmakers.ai" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
