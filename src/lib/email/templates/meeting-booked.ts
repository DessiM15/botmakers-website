// SPEC: Google Calendar Integration > Notification: team email on new booking
// DEP-MAP: Notification System > meetingBookedAlert

interface MeetingBookedData {
  bookedByName: string;
  bookedByEmail: string;
  title: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function meetingBookedAlert(data: MeetingBookedData): { subject: string; html: string } {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://botmakers.ai";

  const joinButton = data.meetingLink
    ? `<div style="text-align:center;margin:20px 0">
        <a href="${data.meetingLink}" style="display:inline-block;padding:12px 32px;background:#03FF00;color:#033457;font-weight:700;text-decoration:none;border-radius:6px;font-size:14px">Join Meeting</a>
      </div>`
    : "";

  return {
    subject: `New Meeting Booked: ${data.bookedByName} — ${data.title}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter Tight',Inter,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <div style="background:#033457;padding:24px 32px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;color:#03FF00;font-size:20px;font-weight:700">Meeting Booked</h1>
  </div>
  <div style="background:#fff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:0 0 20px">
      <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#033457">${data.title}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#3f3f46"><strong>Booked by:</strong> ${data.bookedByName} (${data.bookedByEmail})</p>
      <p style="margin:0 0 4px;font-size:14px;color:#3f3f46"><strong>Start:</strong> ${formatDateTime(data.startTime)}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#3f3f46"><strong>End:</strong> ${formatDateTime(data.endTime)}</p>
    </div>
    ${joinButton}
    <div style="text-align:center;margin:24px 0">
      <a href="${appUrl}/admin/calendar" style="display:inline-block;padding:10px 24px;background:#033457;color:#fff;font-weight:600;text-decoration:none;border-radius:6px;font-size:13px">View in CRM</a>
    </div>
  </div>
  <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 8px 8px;text-align:center">
    <p style="margin:0;font-size:12px;color:#a1a1aa">Botmakers CRM &bull; <a href="https://botmakers.ai" style="color:#1E40AF">botmakers.ai</a></p>
  </div>
</div>
</body></html>`,
  };
}
