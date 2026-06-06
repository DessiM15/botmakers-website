// SPEC: SMS Templates for booking confirmations and reminders
// DEP-MAP: SMS > SERVER > smsBookingConfirmation, smsReminder24h, smsReminder4h

interface BookingConfirmationParams {
  name: string;
  date: string;
  time: string;
  meetingLink: string | null;
}

export function smsBookingConfirmation(params: BookingConfirmationParams): string {
  const link = params.meetingLink ? `\nJoin: ${params.meetingLink}` : "";
  return `Hi ${params.name}! Your BotMakers Discovery Call is confirmed for ${params.date} at ${params.time} CT.${link}\n\nSee you then!`;
}

interface Reminder24hParams {
  name: string;
  time: string;
  meetingLink: string | null;
}

export function smsReminder24h(params: Reminder24hParams): string {
  const link = params.meetingLink ? `\nJoin: ${params.meetingLink}` : "";
  return `Reminder: Your BotMakers Discovery Call is tomorrow at ${params.time} CT.${link}\n\nLooking forward to it, ${params.name}!`;
}

interface Reminder4hParams {
  name: string;
  time: string;
  meetingLink: string | null;
}

export function smsReminder4h(params: Reminder4hParams): string {
  const link = params.meetingLink ? `\nJoin: ${params.meetingLink}` : "";
  return `Hi ${params.name}, your BotMakers Discovery Call starts in ~4 hours at ${params.time} CT.${link}\n\nSee you soon!`;
}
