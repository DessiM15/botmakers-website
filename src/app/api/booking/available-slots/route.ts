// SPEC: Google Calendar Integration > Public Booking API > Available Slots
import { NextRequest, NextResponse } from "next/server";
import { getBookingSettings, getConnectedTeamMembers } from "@/lib/db/queries/calendar";
import { listGoogleCalendarEvents } from "@/lib/integrations/google-calendar";
import { getBookingAvailableLimiter } from "@/lib/rate-limit";

const ALLOWED_ORIGINS = [
  "https://botmakers.ai",
  "https://www.botmakers.ai",
  "https://botmakers-crm.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3005",
];

// Hardcoded defaults until CRM booking settings are configured
const DEFAULT_SETTINGS = {
  availableStartTime: "08:00",
  availableEndTime: "18:30",
  slotDurationMinutes: 30,
  bufferMinutes: 15,
  maxAdvanceDays: 30,
  availableDays: [1, 2, 3, 4, 5] as number[], // Mon-Fri
  timezone: "America/Chicago",
  teamEmails: ["tdaniel@botmakers.ai"],
};

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  // Rate limit
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const limiter = getBookingAvailableLimiter();
  const { success: allowed } = await limiter.limit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers }
    );
  }

  const dateParam = request.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json(
      { error: "date parameter required" },
      { status: 400, headers }
    );
  }

  // Optional timezone param for display purposes
  let requestedTimezone = request.nextUrl.searchParams.get("timezone") ?? undefined;
  if (requestedTimezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: requestedTimezone });
    } catch {
      requestedTimezone = undefined;
    }
  }

  const dbSettings = await getBookingSettings();
  const settings = dbSettings ?? DEFAULT_SETTINGS;

  const requestedDate = new Date(dateParam + "T00:00:00");
  const now = new Date();

  // Check if date is in the future and within max advance days
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
  if (requestedDate < new Date(now.toDateString()) || requestedDate > maxDate) {
    return NextResponse.json(
      { date: dateParam, timezone: settings.timezone, requestedTimezone, slots: [] },
      { headers }
    );
  }

  // Check if day is available
  const dayOfWeek = requestedDate.getDay();
  const availableDays = settings.availableDays as number[];
  if (!availableDays.includes(dayOfWeek)) {
    return NextResponse.json(
      { date: dateParam, timezone: settings.timezone, requestedTimezone, slots: [] },
      { headers }
    );
  }

  // Fetch Google Calendar events if a connected team member exists
  const members = await getConnectedTeamMembers();
  const member = members.find((m) => m.googleRefreshToken) ?? null;

  let googleEvents: Array<{ start?: { dateTime?: string | null; date?: string | null } | null; end?: { dateTime?: string | null; date?: string | null } | null }> = [];
  if (member?.googleRefreshToken) {
    try {
      const dayStart = new Date(dateParam + "T00:00:00");
      const dayEnd = new Date(dateParam + "T23:59:59");
      googleEvents = await listGoogleCalendarEvents(
        member.googleRefreshToken,
        dayStart,
        dayEnd
      );
    } catch (err) {
      console.error("[booking] Google Calendar fetch failed, showing all slots:", err);
    }
  }

  // Generate time slots
  const startTime = (settings.availableStartTime as string) ?? DEFAULT_SETTINGS.availableStartTime;
  const endTime = (settings.availableEndTime as string) ?? DEFAULT_SETTINGS.availableEndTime;
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const slotDuration = settings.slotDurationMinutes;
  const buffer = settings.bufferMinutes;

  const slots: Array<{ start: string; end: string }> = [];
  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotStart = currentMinutes;
    const slotEnd = currentMinutes + slotDuration;

    // Check overlap with Google Calendar events (including buffer)
    const slotStartDate = new Date(requestedDate);
    slotStartDate.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);
    const slotEndDate = new Date(requestedDate);
    slotEndDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);

    const bufferedStart = new Date(slotStartDate.getTime() - buffer * 60 * 1000);
    const bufferedEnd = new Date(slotEndDate.getTime() + buffer * 60 * 1000);

    const hasConflict = googleEvents.some((event) => {
      const eventStart = new Date(event.start?.dateTime ?? event.start?.date ?? "");
      const eventEnd = new Date(event.end?.dateTime ?? event.end?.date ?? "");
      return bufferedStart < eventEnd && bufferedEnd > eventStart;
    });

    // Skip past slots if today
    const isPast = slotStartDate < now;

    if (!hasConflict && !isPast) {
      const fmtTime = (m: number) =>
        `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      slots.push({ start: fmtTime(slotStart), end: fmtTime(slotEnd) });
    }

    currentMinutes += slotDuration;
  }

  return NextResponse.json(
    { date: dateParam, timezone: settings.timezone, requestedTimezone, slots },
    { headers }
  );
}
