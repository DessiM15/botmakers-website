// SPEC: Google Calendar Integration > CLIENT
// DEP-MAP: Google Calendar > createOAuth2Client, getAuthUrl, getCalendarClient
import { google, type calendar_v3 } from "googleapis";
import { env } from "@/lib/env";

const OAuth2 = google.auth.OAuth2;

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

function createOAuth2Client() {
  return new OAuth2(
    env.GOOGLE_CLIENT_ID ?? "",
    env.GOOGLE_CLIENT_SECRET ?? "",
    env.GOOGLE_REDIRECT_URI ?? ""
  );
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(
    env.GOOGLE_CLIENT_ID &&
    env.GOOGLE_CLIENT_SECRET &&
    env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export function getCalendarClient(
  refreshToken: string
): calendar_v3.Calendar {
  const client = createOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth: client });
}

export async function getGoogleUserEmail(
  refreshToken: string
): Promise<string | null> {
  try {
    const client = createOAuth2Client();
    client.setCredentials({ refresh_token: refreshToken });
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const { data } = await oauth2.userinfo.get();
    return data.email ?? null;
  } catch (err) {
    console.error("[CB-INT-006] Failed to get Google user email:", err);
    return null;
  }
}

interface CreateEventParams {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendeeEmails: string[];
  addMeetLink?: boolean;
  location?: string;
}

export async function createGoogleCalendarEvent(
  refreshToken: string,
  params: CreateEventParams
): Promise<calendar_v3.Schema$Event | null> {
  try {
    const calendar = getCalendarClient(refreshToken);

    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.startTime, timeZone: "America/Chicago" },
      end: { dateTime: params.endTime, timeZone: "America/Chicago" },
      attendees: params.attendeeEmails.map((email) => ({ email })),
      reminders: { useDefault: false, overrides: [] },
    };

    if (params.location) {
      event.location = params.location;
    }

    const conferenceVersion = params.addMeetLink ? 1 : 0;

    if (params.addMeetLink) {
      event.conferenceData = {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
    }

    const { data } = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: conferenceVersion,
      sendUpdates: "all",
    });

    return data;
  } catch (err) {
    console.error("[CB-INT-006] Failed to create Google Calendar event:", err);
    return null;
  }
}

export async function listGoogleCalendarEvents(
  refreshToken: string,
  timeMin: Date,
  timeMax: Date
): Promise<calendar_v3.Schema$Event[]> {
  try {
    const calendar = getCalendarClient(refreshToken);
    const events: calendar_v3.Schema$Event[] = [];
    let pageToken: string | undefined;

    do {
      const { data } = await calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 250,
        pageToken,
      });
      if (data.items) events.push(...data.items);
      pageToken = data.nextPageToken ?? undefined;
    } while (pageToken);

    return events;
  } catch (err) {
    console.error("[CB-INT-006] Failed to list Google Calendar events:", err);
    return [];
  }
}

export async function deleteGoogleCalendarEvent(
  refreshToken: string,
  eventId: string
): Promise<void> {
  try {
    const calendar = getCalendarClient(refreshToken);
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
      sendUpdates: "all",
    });
  } catch (err) {
    console.error("[CB-INT-006] Failed to delete Google Calendar event:", err);
  }
}
