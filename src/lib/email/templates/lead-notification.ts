// SPEC: SPEC-WORKFLOWS > Workflow 1 > Step 9: Team notification email
// DEP-MAP: Lead Management > EMAIL > teamLeadNotification

interface LeadNotificationData {
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  projectType?: string | null;
  projectTimeline?: string | null;
  projectDetails?: string | null;
  score?: string | null;
  aiSummary?: string | null;
}

export function teamLeadNotification(lead: LeadNotificationData): {
  subject: string;
  html: string;
} {
  const scoreColor = lead.score === "high" ? "#03FF00" : lead.score === "medium" ? "#F59E0B" : "#EF4444";
  const scoreBadge = lead.score
    ? `<span style="display:inline-block;padding:2px 10px;border-radius:4px;background:${scoreColor};color:#033457;font-weight:600;font-size:13px;text-transform:uppercase">${lead.score}</span>`
    : `<span style="color:#999">Pending</span>`;

  return {
    subject: `New Lead: ${lead.fullName}${lead.companyName ? ` — ${lead.companyName}` : ""}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">New Lead Submitted</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#71717a;width:120px">Name</td><td style="padding:8px 0;font-weight:600">${lead.fullName}</td></tr>
      <tr><td style="padding:8px 0;color:#71717a">Email</td><td style="padding:8px 0"><a href="mailto:${lead.email}" style="color:#1E40AF">${lead.email}</a></td></tr>
      ${lead.phone ? `<tr><td style="padding:8px 0;color:#71717a">Phone</td><td style="padding:8px 0">${lead.phone}</td></tr>` : ""}
      ${lead.companyName ? `<tr><td style="padding:8px 0;color:#71717a">Company</td><td style="padding:8px 0">${lead.companyName}</td></tr>` : ""}
      ${lead.projectType ? `<tr><td style="padding:8px 0;color:#71717a">Project Type</td><td style="padding:8px 0">${lead.projectType}</td></tr>` : ""}
      ${lead.projectTimeline ? `<tr><td style="padding:8px 0;color:#71717a">Timeline</td><td style="padding:8px 0">${lead.projectTimeline}</td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#71717a">AI Score</td><td style="padding:8px 0">${scoreBadge}</td></tr>
    </table>
    ${lead.projectDetails ? `<div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:6px"><p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Project Details</p><p style="margin:0;font-size:14px;line-height:1.6;color:#18181b">${lead.projectDetails.substring(0, 500)}</p></div>` : ""}
    ${lead.aiSummary ? `<div style="margin-top:16px;padding:16px;background:#033457;border-radius:6px"><p style="margin:0 0 4px;font-size:12px;color:#03FF00;text-transform:uppercase;letter-spacing:0.5px">AI Summary</p><p style="margin:0;font-size:14px;line-height:1.6;color:#e2e8f0">${lead.aiSummary}</p></div>` : ""}
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM — botmakers.ai</p>
  </div>
</div>
</body></html>`,
  };
}
