// SPEC: SPEC-WORKFLOWS > Workflow 10 > Step 2: Team alert
// DEP-MAP: Notification System > clientQuestionAlert

interface ClientQuestionAlertData {
  clientName: string;
  projectName: string;
  question: string;
}

export function clientQuestionAlert(data: ClientQuestionAlertData): { subject: string; html: string } {
  return {
    subject: `New Question from ${data.clientName} — ${data.projectName}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#F59E0B;font-size:20px;font-weight:700">New Client Question</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">${data.projectName}</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <table style="width:100%;font-size:14px">
      <tr><td style="padding:8px 0;color:#71717a;width:100px">Client</td><td style="padding:8px 0;font-weight:600">${data.clientName}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Project</td><td style="padding:8px 0">${data.projectName}</td></tr>
    </table>
    <div style="margin:16px 0;padding:16px;background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:4px">
      <p style="margin:0 0 4px;font-size:12px;color:#92400E;text-transform:uppercase">Question</p>
      <p style="margin:0;font-size:14px;color:#18181b;line-height:1.6">${data.question.substring(0, 500)}</p>
    </div>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
