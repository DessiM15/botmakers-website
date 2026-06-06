// SPEC: SPEC-WORKFLOWS > Workflow 10 > Step 5: Reply email
// DEP-MAP: Notification System > questionReplied

interface QuestionRepliedData {
  clientName: string;
  projectName: string;
  question: string;
  reply: string;
}

export function questionReplied(data: QuestionRepliedData): { subject: string; html: string } {
  const firstName = data.clientName.split(" ")[0];
  return {
    subject: `Your Question Answered — ${data.projectName}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">Question Answered</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">${data.projectName}</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:16px;color:#18181b">Hi ${firstName},</p>
    <div style="margin:16px 0;padding:16px;background:#f4f4f5;border-radius:6px">
      <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase">Your Question</p>
      <p style="margin:0;font-size:14px;color:#18181b;line-height:1.6">${data.question}</p>
    </div>
    <div style="margin:16px 0;padding:16px;background:#f0fdf4;border-radius:6px">
      <p style="margin:0 0 4px;font-size:12px;color:#03FF00;text-transform:uppercase">Our Response</p>
      <p style="margin:0;font-size:14px;color:#18181b;line-height:1.6">${data.reply}</p>
    </div>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
