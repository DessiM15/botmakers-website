// SPEC: SPEC-WORKFLOWS > Workflow 13 > Overdue milestone cron email
// DEP-MAP: Notification System > overdueAlert

interface OverdueAlertData {
  milestones: Array<{ title: string; projectName: string; dueDate: string }>;
}

export function overdueAlert(data: OverdueAlertData): { subject: string; html: string } {
  const rows = data.milestones.map((m) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #e4e4e7">${m.title}</td><td style="padding:8px;border-bottom:1px solid #e4e4e7">${m.projectName}</td><td style="padding:8px;border-bottom:1px solid #e4e4e7;color:#EF4444;font-weight:600">${m.dueDate}</td></tr>`
  ).join("");

  return {
    subject: `${data.milestones.length} Overdue Milestone${data.milestones.length > 1 ? "s" : ""}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#EF4444;font-size:20px;font-weight:700">Overdue Milestones</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:14px;color:#3f3f46">The following milestones are past their due date:</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Milestone</th><th style="padding:8px;text-align:left">Project</th><th style="padding:8px;text-align:left">Due Date</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
