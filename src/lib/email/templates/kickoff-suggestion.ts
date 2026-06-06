// SPEC: Calendar ↔ CRM Integration > Feature 3: Proposal Acceptance → Kickoff Meeting Prompt
// DEP-MAP: Notification System > kickoffSuggestion

interface KickoffSuggestionData {
  clientName: string;
  projectTitle: string;
  proposalTitle: string;
  adminUrl: string;
}

export function kickoffSuggestion(data: KickoffSuggestionData): {
  subject: string;
  html: string;
} {
  return {
    subject: `Proposal Accepted — Schedule Kickoff: ${data.clientName}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">Schedule Kickoff Meeting</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46"><strong>${data.clientName}</strong> has accepted the proposal <strong>"${data.proposalTitle}"</strong>.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:0 0 20px">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#166534">Action Required</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46">Schedule a kickoff meeting with ${data.clientName} to align on project scope, timeline, and communication preferences.</p>
    </div>
    <div style="text-align:center;margin:24px 0">
      <a href="${data.adminUrl}" style="display:inline-block;padding:12px 32px;background:#03FF00;color:#033457;font-weight:700;text-decoration:none;border-radius:6px;font-size:14px">View in CRM</a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM &bull; <a href="https://botmakers.ai" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
