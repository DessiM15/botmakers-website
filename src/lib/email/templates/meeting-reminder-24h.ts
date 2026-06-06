// SPEC: Google Calendar Integration > Email > 24h Reminder

interface MeetingReminder24hData {
  name: string;
  date: string;
  time: string;
  meetingLink: string | null;
}

export function meetingReminder24h(
  data: MeetingReminder24hData
): { subject: string; html: string } {
  const firstName = data.name.split(" ")[0];

  return {
    subject: "Reminder: Your BotMakers Demo is Tomorrow!",
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="margin:0;color:#03FF00;font-size:24px;font-weight:700">Botmakers.ai</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:14px">Meeting Reminder</p>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <h2 style="margin:0 0 16px;font-size:20px;color:#18181b">Hi ${firstName},</h2>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3f3f46">
      Just a friendly reminder that your demo with BotMakers is <strong>tomorrow</strong>!
    </p>
    <div style="margin:20px 0;padding:20px;background:#f0fdf4;border-left:4px solid #03FF00;border-radius:4px">
      <p style="margin:0 0 4px;font-size:14px;color:#3f3f46"><strong>Date:</strong> ${data.date}</p>
      <p style="margin:0;font-size:14px;color:#3f3f46"><strong>Time:</strong> ${data.time} (Central Time)</p>
    </div>
    ${data.meetingLink ? `
    <div style="text-align:center;margin:24px 0">
      <a href="${data.meetingLink}" style="display:inline-block;padding:14px 36px;background:#03FF00;color:#033457;font-weight:700;text-decoration:none;border-radius:6px;font-size:15px">
        Join Meeting &rarr;
      </a>
    </div>` : ""}
  </div>
  <div style="padding:20px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">BotMakers Inc. &bull; <a href="https://botmakers.ai" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
