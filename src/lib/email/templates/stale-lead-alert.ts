// SPEC: SPEC-WORKFLOWS > Workflow 12 > Stale lead cron email
// DEP-MAP: Notification System > staleLeadAlert

interface StaleLeadAlertData {
  leads: Array<{ fullName: string; email: string; daysSinceChange: number; stage: string }>;
}

export function staleLeadAlert(data: StaleLeadAlertData): { subject: string; html: string } {
  const leadRows = data.leads.map((l) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #e4e4e7">${l.fullName}</td><td style="padding:8px;border-bottom:1px solid #e4e4e7">${l.email}</td><td style="padding:8px;border-bottom:1px solid #e4e4e7">${l.stage}</td><td style="padding:8px;border-bottom:1px solid #e4e4e7;color:#F59E0B;font-weight:600">${l.daysSinceChange}d</td></tr>`
  ).join("");

  return {
    subject: `${data.leads.length} Stale Lead${data.leads.length > 1 ? "s" : ""} Need Attention`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#F59E0B;font-size:20px;font-weight:700">Stale Leads Alert</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46">The following leads haven't progressed in 7+ days:</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Name</th><th style="padding:8px;text-align:left">Email</th><th style="padding:8px;text-align:left">Stage</th><th style="padding:8px;text-align:left">Stale</th></tr></thead>
      <tbody>${leadRows}</tbody>
    </table>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
