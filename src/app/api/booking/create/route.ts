// SPEC: Google Calendar Integration > Public Booking API > Create Booking
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { calendarEvents, leads, activityLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getBookingSettings, getConnectedTeamMembers } from "@/lib/db/queries/calendar";
import { createGoogleCalendarEvent } from "@/lib/integrations/google-calendar";
import { getBookingCreateLimiter } from "@/lib/rate-limit";
import { publicBookingSchema } from "@/lib/types/schemas";
import { sendEmail } from "@/lib/email/client";
import { meetingConfirmation } from "@/lib/email/templates/meeting-confirmation";
import { meetingBookedAlert } from "@/lib/email/templates/meeting-booked";
import { getClientByEmail } from "@/lib/db/queries/clients";
import { sendSms } from "@/lib/integrations/twilio";
import { smsBookingConfirmation } from "@/lib/sms/templates";
import { env } from "@/lib/env";

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
  slotDurationMinutes: 30,
  timezone: "America/Chicago",
  teamEmails: ["tdaniel@botmakers.ai"],
};

function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function formatInTimezone(date: Date, timezone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: timezone }).format(date);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  // Rate limit
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const limiter = getBookingCreateLimiter();
  const { success: allowed } = await limiter.limit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers }
    );
  }

  const body = await request.json();
  const parsed = publicBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", issues: parsed.error.issues },
      { status: 400, headers }
    );
  }

  const input = parsed.data;
  const prospectTz = input.timezone;
  const dbSettings = await getBookingSettings();
  const settings = {
    slotDurationMinutes: dbSettings?.slotDurationMinutes ?? DEFAULT_SETTINGS.slotDurationMinutes,
    timezone: dbSettings?.timezone ?? DEFAULT_SETTINGS.timezone,
    teamEmails: (dbSettings?.teamEmails as string[]) ?? DEFAULT_SETTINGS.teamEmails,
  };

  // Find connected team member (optional — booking works without Google Calendar)
  const members = await getConnectedTeamMembers();
  const member = members.find((m) => m.googleRefreshToken) ?? null;

  const slotDuration = settings.slotDurationMinutes;

  // Build start/end times
  const startDateTime = new Date(`${input.date}T${input.start_time}:00`);
  const endDateTime = new Date(
    startDateTime.getTime() + slotDuration * 60 * 1000
  );

  // Collect attendee emails (team + prospect)
  const teamEmails = settings.teamEmails;
  const allAttendees = [...teamEmails, input.email];

  // Create Google Calendar event with Meet link (if Google Calendar connected)
  let meetingLink: string | null = null;
  let googleEventId: string | null = null;
  let googleHtmlLink: string | null = null;

  if (member?.googleRefreshToken) {
    try {
      const googleEvent = await createGoogleCalendarEvent(
        member.googleRefreshToken,
        {
          summary: `BotMakers Discovery Call — ${input.name}`,
          description: input.message
            ? `Message from prospect:\n${input.message}`
            : undefined,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          attendeeEmails: allAttendees,
          addMeetLink: true,
        }
      );
      meetingLink = googleEvent?.hangoutLink ?? null;
      googleEventId = googleEvent?.id ?? null;
      googleHtmlLink = googleEvent?.htmlLink ?? null;
    } catch (err) {
      console.error("[booking] Google Calendar event creation failed:", err);
    }
  }

  // Try to match or create lead
  let leadId: string | null = null;
  const [existingLead] = await db
    .select()
    .from(leads)
    .where(eq(leads.email, input.email))
    .limit(1);

  if (existingLead) {
    leadId = existingLead.id;
    await db
      .update(leads)
      .set({
        pipelineStage: "discovery_scheduled",
        pipelineStageChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));
  } else {
    const [newLead] = await db
      .insert(leads)
      .values({
        fullName: input.name,
        email: input.email,
        phone: input.phone ?? null,
        companyName: input.company ?? null,
        projectDetails: input.message ?? null,
        source: "web_form",
        pipelineStage: "discovery_scheduled",
        pipelineStageChangedAt: new Date(),
      })
      .returning();
    leadId = newLead.id;
  }

  // Client recognition — check if booker is an existing client
  let relatedClientId: string | null = null;
  const existingClient = await getClientByEmail(input.email);
  if (existingClient) {
    relatedClientId = existingClient.id;
  }

  // Save to calendar_events
  const [event] = await db
    .insert(calendarEvents)
    .values({
      googleEventId,
      title: `BotMakers Discovery Call — ${input.name}`,
      description: input.message ?? null,
      startTime: startDateTime,
      endTime: endDateTime,
      meetingLink,
      eventType: "discovery_call",
      relatedLeadId: leadId,
      relatedClientId,
      bookedByName: input.name,
      bookedByEmail: input.email,
      bookedByPhone: input.phone ?? null,
      bookedByCompany: input.company ?? null,
      googleHtmlLink,
    })
    .returning();

  // Log activity for lead
  await db
    .insert(activityLog)
    .values({
      action: "booking.created",
      entityType: "lead",
      entityId: leadId!,
      metadata: { name: input.name, email: input.email, eventId: event.id },
    })
    .catch(() => {});

  // Log activity for client if recognized
  if (relatedClientId) {
    await db
      .insert(activityLog)
      .values({
        action: "booking.created_by_client",
        entityType: "client",
        entityId: relatedClientId,
        metadata: { name: input.name, email: input.email, eventId: event.id },
      })
      .catch(() => {});
  }

  // Format times in prospect's timezone for email
  const formattedDate = formatInTimezone(startDateTime, prospectTz, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = formatInTimezone(startDateTime, prospectTz, {
    hour: "numeric",
    minute: "2-digit",
  });

  // Send confirmation email to prospect
  const confirmation = meetingConfirmation({
    name: input.name,
    date: formattedDate,
    time: formattedTime,
    meetingLink,
  });
  sendEmail({
    to: input.email,
    subject: confirmation.subject,
    html: confirmation.html,
  }).catch((err) => console.error("[CB-INT-001] Confirmation email failed:", err));

  // Send team alert — always notify tdaniel@botmakers.ai
  const teamNotifEmails = env.TEAM_NOTIFICATION_EMAILS
    ? env.TEAM_NOTIFICATION_EMAILS.split(",")
    : teamEmails.length > 0
      ? teamEmails
      : DEFAULT_SETTINGS.teamEmails;
  if (teamNotifEmails.length > 0) {
    const alert = meetingBookedAlert({
      bookedByName: input.name,
      bookedByEmail: input.email,
      title: `BotMakers Discovery Call — ${input.name}`,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      meetingLink,
    });
    sendEmail({
      to: teamNotifEmails,
      subject: alert.subject,
      html: alert.html,
    }).catch((err) => console.error("[CB-INT-001] Team alert failed:", err));
  }

  // Send SMS confirmation if phone provided (fire-and-forget)
  if (input.phone) {
    const smsFormattedTime = formatInTimezone(startDateTime, "America/Chicago", {
      hour: "numeric",
      minute: "2-digit",
    });
    sendSms({
      to: input.phone,
      body: smsBookingConfirmation({
        name: input.name,
        date: formattedDate,
        time: smsFormattedTime,
        meetingLink,
      }),
    }).catch((err) => console.error("[CB-INT-005] Booking SMS failed:", err));
  }

  return NextResponse.json(
    { success: true, meetingLink, eventId: event.id },
    { status: 201, headers }
  );
}
