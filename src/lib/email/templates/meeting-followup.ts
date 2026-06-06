// SPEC: Calendar ↔ CRM Integration > Feature 4: Post-Meeting Follow-Up
// DEP-MAP: Notification System > meetingFollowUp

interface MeetingFollowUpData {
  recipientName: string;
  meetingTitle: string;
  meetingDate: string;
  nextSteps: string;
}

const NEXT_STEPS_BY_TYPE: Record<string, string> = {
  discovery_call:
    "We'll prepare a proposal based on our discussion and send it your way shortly.",
  demo_booking:
    "We hope the demo was helpful. We'll follow up with next steps soon.",
  follow_up:
    "We'll follow up with any action items discussed during our meeting.",
  client_meeting:
    "We'll follow up with any action items discussed during our meeting.",
};

export function getNextStepsForEventType(eventType: string): string {
  return NEXT_STEPS_BY_TYPE[eventType] ?? "We'll be in touch with next steps.";
}

export function meetingFollowUp(data: MeetingFollowUpData): {
  subject: string;
  html: string;
} {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://botmakers.ai";

  return {
    subject: `Thanks for meeting with BotMakers — ${data.meetingTitle}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">Thanks for Meeting with Us!</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46">Hi ${data.recipientName},</p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46">Thank you for taking the time to meet with us for <strong>${data.meetingTitle}</strong> on ${data.meetingDate}.</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:20px;margin:0 0 20px">
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#033457">Next Steps</p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46">${data.nextSteps}</p>
    </div>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#3f3f46">If you have any questions in the meantime, don't hesitate to reach out. We're here to help!</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#3f3f46">Best regards,<br><strong>The BotMakers Team</strong></p>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">BotMakers Inc. &bull; <a href="${appUrl}" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
