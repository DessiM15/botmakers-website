# BUILD PROMPT: Replace Cal.com with Google Calendar Integration

## Context

You are working on the Botmakers CRM — a Next.js 16 + TypeScript strict + Supabase + Drizzle ORM + shadcn/ui application. Read `CLAUDE.md` before touching any code. Run `npm run build` to confirm baseline passes before and after all changes.

The CRM currently has a Cal.com webhook integration for meetings. We are **replacing it entirely** with a direct Google Calendar API integration (read/write + cron sync, NO Google webhooks). Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`) are already in `.env.local`.

## Pre-Existing Build Issues (Fix First)

1. **Duplicate login routes** — `src/app/admin/(auth)/login` and `src/app/admin/login/` conflict (same for portal). Delete the `(auth)` route group directories — the `login/` directories are the ones with loading states.
2. **Square SDK v44 bug** — `node_modules/square/api/resources/locations/resources/transactions/client/requests/` is an empty directory that Turbopack can't resolve. Create stub `index.js` (`"use strict"; Object.defineProperty(exports, "__esModule", { value: true });`) and `index.d.ts` (`export {};`) in that directory.

Confirm `npm run build` passes before proceeding.

---

## What Exists Today (Cal.com) — Files to Modify or Remove

| File | What It Does | Action |
|------|-------------|--------|
| `src/app/api/webhooks/calcom/route.ts` | Cal.com webhook (BOOKING_CREATED/RESCHEDULED/CANCELLED) | **DELETE** |
| `src/lib/db/schema.ts` | `meetings` table with `calcomBookingUid`, `meetingSourceEnum('cal_com','manual')` | **MIGRATE** to `calendar_events` |
| `src/lib/db/queries/meetings.ts` | `getMeetings`, `getMeetingById`, `getMeetingByCalcomUid`, `getUpcomingMeetings`, `getTodaysMeetings` | **REWRITE** for new table |
| `src/lib/types/meetings.ts` | `Meeting`, `MeetingStatus`, `MeetingWithLead` types | **REWRITE** for new schema |
| `src/app/admin/meetings/page.tsx` | Meetings list page (table view) | **REWRITE** as calendar view |
| `src/app/admin/meetings/loading.tsx` | Skeleton loading | **REWRITE** for calendar skeleton |
| `src/components/admin/meetings-list.tsx` | Client component — table with status badges, join links | **REPLACE** with calendar component |
| `src/components/admin/sidebar-nav.tsx` | Has "Meetings" nav item with Calendar icon | **RENAME** to "Calendar" |
| `src/app/admin/page.tsx` | Dashboard — "Today's Meetings" alert widget | **REPLACE** with "Upcoming Meetings" widget (next 7 days) |
| `src/lib/db/queries/dashboard.ts` | `getAlerts()` returns `todaysMeetings` | **UPDATE** to query `calendar_events` |
| `src/lib/email/templates/meeting-booked.ts` | `meetingBookedAlert()` — team notification | **KEEP + ADAPT** for Google Calendar events |
| `src/lib/env.ts` | Has `CAL_COM_WEBHOOK_SECRET` (optional) | **REMOVE**, add Google env vars |

---

## DATABASE CHANGES

### 1. Add columns to `team_users` table (in `src/lib/db/schema.ts`)

```typescript
googleRefreshToken: text('google_refresh_token'),
googleCalendarConnected: boolean('google_calendar_connected').default(false).notNull(),
googleCalendarEmail: text('google_calendar_email'),
```

### 2. Create `calendar_events` table (replaces `meetings`)

```typescript
export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  googleEventId: text('google_event_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  location: text('location'),
  meetingLink: text('meeting_link'),
  attendees: jsonb('attendees'), // Array of { email, name, responseStatus }
  eventType: text('event_type'), // 'discovery_call' | 'client_meeting' | 'internal' | 'follow_up' | 'demo_booking' | 'other'
  relatedLeadId: uuid('related_lead_id').references(() => leads.id),
  relatedProjectId: uuid('related_project_id').references(() => projects.id),
  relatedClientId: uuid('related_client_id').references(() => clients.id),
  bookedByName: text('booked_by_name'),
  bookedByEmail: text('booked_by_email'),
  bookedByPhone: text('booked_by_phone'),
  bookedByCompany: text('booked_by_company'),
  reminder24hSent: boolean('reminder_24h_sent').default(false).notNull(),
  reminder4hSent: boolean('reminder_4h_sent').default(false).notNull(),
  createdBy: uuid('created_by').references(() => teamUsers.id),
  googleCalendarId: text('google_calendar_id'),
  googleHtmlLink: text('google_html_link'),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('calendar_events_start_time_idx').on(table.startTime),
  index('calendar_events_google_event_id_idx').on(table.googleEventId),
  index('calendar_events_lead_id_idx').on(table.relatedLeadId),
  index('calendar_events_booked_by_email_idx').on(table.bookedByEmail),
]);
```

### 3. Create `booking_settings` table (single-row config)

```typescript
export const bookingSettings = pgTable('booking_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  slotDurationMinutes: integer('slot_duration_minutes').default(30).notNull(),
  availableDays: jsonb('available_days').default([1,2,3,4,5]).notNull(), // Mon-Fri
  availableStartTime: text('available_start_time').default('09:00').notNull(),
  availableEndTime: text('available_end_time').default('17:00').notNull(),
  timezone: text('timezone').default('America/Chicago').notNull(),
  bufferMinutes: integer('buffer_minutes').default(15).notNull(),
  maxAdvanceDays: integer('max_advance_days').default(30).notNull(),
  teamEmails: jsonb('team_emails').default(['jay@m.botmakers.ai','dessiah@m.botmakers.ai','trent@botmakers.ai']).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### 4. Remove old `meetings` table, `meetingStatusEnum`, `meetingSourceEnum`

### 5. Write and run Drizzle migration

Generate migration, apply to Supabase, seed `booking_settings` with one default row.

---

## FEATURE 1: Google Calendar Client Library

**File:** `src/lib/integrations/google-calendar.ts` (TypeScript, not JS)

Install: `npm install googleapis`

```typescript
import { google } from 'googleapis';

export function createOAuth2Client() { /* uses env.GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI */ }
export function getAuthUrl(): string { /* access_type: 'offline', prompt: 'consent', scopes: calendar + calendar.events */ }
export function getCalendarClient(refreshToken: string) { /* sets refresh_token credentials, returns google.calendar v3 */ }
```

Follow the project pattern: lazy initialization, no eager env reads. Use `getEnv()` from `src/lib/env.ts` inside functions, not at module scope.

---

## FEATURE 2: Google OAuth Routes

**File:** `src/app/api/auth/google/route.ts`
- GET → Require team auth (`requireTeam()` from `src/lib/auth/helpers.ts`)
- Generate auth URL via `getAuthUrl()`, redirect to Google consent screen

**File:** `src/app/api/auth/google/callback/route.ts`
- GET → Exchange authorization code for tokens
- Save `refresh_token` to `team_users.google_refresh_token`
- Set `google_calendar_connected = true`, `google_calendar_email` = authenticated email
- Redirect to `/admin/settings` with `?google=connected` query param
- On error, redirect to `/admin/settings?google=error`

---

## FEATURE 3: Settings — Google Calendar Connection

**Update:** `src/app/admin/settings/page.tsx`

Add an "Integrations" section (or add to existing):
- **Google Calendar** card showing connection status per team member
- If connected: show green badge + connected email + "Disconnect" button
- If not connected: show "Connect Google Calendar" button → calls `/api/auth/google`
- Disconnect action: clears `google_refresh_token`, sets `google_calendar_connected = false`

Follow existing settings page patterns. Use server action for disconnect.

---

## FEATURE 4: Public Booking API (Landing Page Integration)

These routes must be **PUBLIC** (no auth), **rate-limited**, with **CORS headers**.

CORS helper (reusable):
```typescript
const ALLOWED_ORIGINS = ['https://botmakers.ai', 'https://www.botmakers.ai', 'http://localhost:3000', 'http://localhost:3001'];
// Set Access-Control-Allow-Origin, Allow-Methods, Allow-Headers
// Handle OPTIONS preflight requests returning 204
```

### `src/app/api/booking/available-slots/route.ts`

**GET** `?date=2026-03-10`
- Rate limit: 20/min per IP (use existing `src/lib/rate-limit.ts` pattern with lazy Upstash)
- Fetch `booking_settings` row
- Find first team member with `google_calendar_connected = true`
- Fetch their Google Calendar events for that date
- Generate all possible slots between `available_start_time` and `available_end_time` at `slot_duration_minutes` intervals
- Remove slots overlapping calendar events (including `buffer_minutes` gap)
- Remove past slots if date is today
- Return: `{ date, timezone, slots: [{ start: "09:00", end: "09:30" }, ...] }`

### `src/app/api/booking/create/route.ts`

**POST** `{ name, email, phone?, company?, date, startTime, message? }`
- Rate limit: 5/hour per IP
- Validate with Zod (name + email required)
- Re-verify slot is still available (prevent double-booking)
- Create Google Calendar event via API:
  - Summary: `"BotMakers Discovery Call — [name]"`
  - Attendees: all emails from `booking_settings.team_emails` + prospect email
  - Auto-create Google Meet link (`conferenceDataVersion: 1`, `conferenceData.createRequest`)
  - Disable Google's default reminders (we send our own branded ones)
- Save to `calendar_events`: event_type `'demo_booking'`, booked_by fields, meeting_link from `hangoutLink`
- Auto-create lead: `INSERT INTO leads` with `source: 'web_form'`, `pipeline_stage: 'discovery_scheduled'`
- Link `calendar_events.related_lead_id` to new lead
- Send branded confirmation email to prospect (see EMAIL 1 below)
- Send notification email to all team members (adapt existing `meetingBookedAlert` template)
- Log to `activity_log`: `{ action: 'booking.created', entity_type: 'lead' }`
- Return: `{ success: true, meetingLink, eventId }`

---

## FEATURE 5: Calendar Page (Replace Meetings Table View)

**Rename route:** `/admin/meetings` → `/admin/calendar` (update sidebar nav href + label to "Calendar")

**File:** `src/app/admin/calendar/page.tsx` (server component)
**File:** `src/components/admin/calendar-view.tsx` (client component)
**File:** `src/app/admin/calendar/loading.tsx` (skeleton)

### Calendar UI Requirements

Build a proper monthly/weekly/daily calendar view. Use a clean, custom implementation with shadcn/ui components (Card, Button, Badge, Dialog). Do NOT use any external calendar library — build it with CSS Grid.

**Monthly view (default):**
- 7-column grid (Sun–Sat), rows for weeks
- Each day cell shows event dots/chips (max 3 visible, "+N more" overflow)
- Click a day → switches to day view
- Nav: `< March 2026 >` with prev/next month buttons
- "Today" button to jump to current date
- View toggle: Month | Week | Day

**Week view:**
- 7-column grid with time slots on Y-axis (8 AM – 6 PM)
- Events as positioned blocks spanning their duration
- Current time indicator line (red)

**Day view:**
- Single column with hourly time slots
- Events as blocks with full detail (title, time, attendees, type badge)

**Color coding by `event_type`:**
- `demo_booking` / `discovery_call`: green (#03FF00 bg with dark text)
- `client_meeting`: navy (#033457 bg with white text)
- `internal`: gray (#6c757d)
- `follow_up`: blue (#1E40AF)
- `other`: light gray

**Event click → Dialog/Sheet:**
- Title, date/time, duration
- Event type badge (color-coded)
- Attendees list
- Google Meet link ("Join Meeting" button)
- Google Calendar link ("Open in Google Calendar")
- Related lead/client/project link (if linked)
- Booked-by info (if demo booking)

**Data source:** Fetch events from Google Calendar API live for accuracy (fall back to `calendar_events` table if API fails). The calendar page should call a server action or API route that:
1. Gets the connected team member's refresh token
2. Calls Google Calendar API for the visible date range
3. Returns formatted events

**Empty state:** If no team member has connected Google Calendar → show centered message: "Connect Google Calendar in Settings to view your schedule" with a button linking to `/admin/settings`.

**"+ New Event" button** → opens create event modal (see Feature 6).

---

## FEATURE 6: Create Event from CRM

### Create Event Modal/Dialog

Available from:
- Calendar page: "+ New Event" button
- Lead detail (`src/components/admin/lead-detail.tsx`): "Schedule Meeting" button → pre-fills title "Discovery Call with [Lead Name]", attendee = lead email
- Client detail: "Schedule Meeting" → pre-fills "Meeting with [Client Name]"
- Project detail (`src/components/admin/project-detail.tsx`): "Schedule Meeting" → pre-fills "Meeting re: [Project Name]"

**Modal fields:**
- Title (text, pre-filled based on context)
- Date (date picker)
- Start time (time picker, 15-min intervals)
- Duration (dropdown: 15 / 30 / 45 / 60 min, default 30)
- Event type (dropdown: discovery_call, client_meeting, internal, follow_up, demo_booking, other)
- Attendees (pre-filled + add more via email input, chip display)
- Add Google Meet (toggle, default ON)
- Description (textarea)
- [Create Event] button with loading state

**Server action:** `src/lib/actions/calendar.ts` → `createCalendarEvent()`
1. Create event via Google Calendar API (with `conferenceDataVersion: 1` if Meet toggled on)
2. Save to `calendar_events` with `related_lead_id` / `related_client_id` / `related_project_id` as appropriate
3. If discovery call for a lead → update lead `pipeline_stage` to `'discovery_scheduled'`
4. Send branded notification email to all attendees
5. Log to `activity_log`
6. Return success + event data

---

## FEATURE 7: Dashboard "Upcoming Meetings" Widget

**Update:** `src/app/admin/page.tsx`

Replace the current "Today's Meetings" alert with an "Upcoming Meetings" card:
- Shows events from `calendar_events` table for the next 7 days
- Max 10 items, ordered by `start_time` ASC
- Each item shows:
  - Color dot by `event_type`
  - Title (truncated)
  - Date + time (e.g., "Mon Mar 10, 9:00 AM")
  - "Join Meet" button if `meeting_link` exists
  - Link to related lead/client if linked
- Empty state: "No upcoming meetings"
- "View Calendar" link → `/admin/calendar`

**Update:** `src/lib/db/queries/dashboard.ts`
- Update `getAlerts()` to query `calendar_events` instead of `meetings`
- New query: `getUpcomingCalendarEvents(days: number, limit: number)`

---

## FEATURE 8: Branded Meeting Emails

**Update/create in:** `src/lib/email/templates/`

All emails follow the existing template pattern — return `{ subject: string; html: string }` with inline HTML using the brand colors (navy #033457 header, green #03FF00 accents, white content area, Inter Tight font stack). Look at existing templates like `prospect-confirmation.ts` for the pattern.

### `meeting-confirmation.ts` — Sent to prospect on booking
- **Subject:** `Your BotMakers Demo is Confirmed!`
- **Body:** Date, time, timezone (America/Chicago), Google Meet link as green CTA button "Join Meeting →", "We'll send you a reminder before the meeting"

### `meeting-reminder-24h.ts` — Sent 24 hours before
- **Subject:** `Reminder: Your BotMakers Demo is Tomorrow!`
- **Body:** Date, time, Google Meet link as CTA button

### `meeting-reminder-4h.ts` — Sent 4 hours before
- **Subject:** `Your BotMakers Demo is in 4 Hours!`
- **Body:** Time, Google Meet link as CTA button, "See you soon!"

### Update `meeting-booked.ts` — Team notification
- Adapt to use `calendar_events` fields instead of old `meetings` fields
- Include Google Meet link, Google Calendar link, booked-by info

---

## FEATURE 9: Reminder Cron Job

**File:** `src/app/api/cron/meeting-reminders/route.ts`

Runs every hour. Requires `CRON_SECRET` header (follow existing cron pattern in `src/app/api/cron/stale-leads/route.ts`).

**24-hour reminders:**
- Query: `calendar_events WHERE start_time BETWEEN now()+23h AND now()+25h AND reminder_24h_sent = false AND booked_by_email IS NOT NULL`
- Send `meeting-reminder-24h` email to prospect + team
- Set `reminder_24h_sent = true`

**4-hour reminders:**
- Query: `calendar_events WHERE start_time BETWEEN now()+3.5h AND now()+4.5h AND reminder_4h_sent = false AND booked_by_email IS NOT NULL`
- Send `meeting-reminder-4h` email to prospect + team
- If Twilio configured: send SMS to team (follow existing optional Twilio pattern)
- Set `reminder_4h_sent = true`

---

## FEATURE 10: Calendar Sync Cron

**File:** `src/app/api/cron/sync-calendar/route.ts`

Runs every 30 minutes. Requires `CRON_SECRET` header.

For each `team_user` WHERE `google_calendar_connected = true`:
1. Get their `google_refresh_token`, create calendar client
2. Fetch events from `now` to `now + 14 days` via `calendar.events.list()`
3. Upsert into `calendar_events` by `google_event_id` (insert if new, update if changed)
4. For each event, match attendee emails against `leads.email` and `clients.email` — set `related_lead_id` / `related_client_id` if matched
5. If token refresh fails (expired/revoked): set `google_calendar_connected = false`, log warning to `activity_log`
6. Cleanup: delete `calendar_events` where `start_time` < 30 days ago

---

## FEATURE 11: Vercel Cron Config

**Create:** `vercel.json` (does not exist yet)

```json
{
  "crons": [
    { "path": "/api/cron/meeting-reminders", "schedule": "0 * * * *" },
    { "path": "/api/cron/sync-calendar", "schedule": "*/30 * * * *" },
    { "path": "/api/cron/stale-leads", "schedule": "0 9 * * 1" },
    { "path": "/api/cron/overdue-milestones", "schedule": "0 9 * * *" }
  ]
}
```

Include existing cron jobs too so nothing is lost.

---

## ENV CHANGES

### `src/lib/env.ts`

**Remove:**
- `CAL_COM_WEBHOOK_SECRET`

**Add:**
```typescript
GOOGLE_CLIENT_ID: z.string().min(1),
GOOGLE_CLIENT_SECRET: z.string().min(1),
GOOGLE_REDIRECT_URI: z.string().url(),
```

These are **required** (not optional) since Google Calendar is now a core feature.

---

## CLEANUP — Remove All Cal.com Code

After all features work:
1. Delete `src/app/api/webhooks/calcom/route.ts`
2. Remove `meetings` table, `meetingStatusEnum`, `meetingSourceEnum` from schema
3. Remove `src/lib/db/queries/meetings.ts`
4. Remove `src/lib/types/meetings.ts` (replace with calendar event types)
5. Remove any `calcom` references in `src/components/admin/meetings-list.tsx` (file gets replaced)
6. Remove `CAL_COM_WEBHOOK_SECRET` from `src/lib/env.ts`
7. Remove `'cal_com'` from any notification type enums — replace with `'meeting_booked'` keeping the same enum value
8. Update any imports referencing old meetings types/queries
9. Search entire codebase for "cal.com", "calcom", "Cal.com", "cal_com" — remove all references
10. `npm run build` — must pass with zero errors

---

## FILE CHECKLIST (New + Modified)

### New Files
- [ ] `src/lib/integrations/google-calendar.ts`
- [ ] `src/app/api/auth/google/route.ts`
- [ ] `src/app/api/auth/google/callback/route.ts`
- [ ] `src/app/api/booking/available-slots/route.ts`
- [ ] `src/app/api/booking/create/route.ts`
- [ ] `src/app/admin/calendar/page.tsx`
- [ ] `src/app/admin/calendar/loading.tsx`
- [ ] `src/components/admin/calendar-view.tsx`
- [ ] `src/components/admin/create-event-modal.tsx`
- [ ] `src/lib/actions/calendar.ts`
- [ ] `src/lib/db/queries/calendar.ts`
- [ ] `src/lib/types/calendar.ts`
- [ ] `src/lib/email/templates/meeting-confirmation.ts`
- [ ] `src/lib/email/templates/meeting-reminder-24h.ts`
- [ ] `src/lib/email/templates/meeting-reminder-4h.ts`
- [ ] `src/app/api/cron/meeting-reminders/route.ts`
- [ ] `src/app/api/cron/sync-calendar/route.ts`
- [ ] `vercel.json`
- [ ] `supabase/migrations/XXXX_google_calendar.sql`

### Modified Files
- [ ] `src/lib/db/schema.ts` — new tables, remove old meetings table
- [ ] `src/lib/env.ts` — swap CAL_COM for GOOGLE vars
- [ ] `src/components/admin/sidebar-nav.tsx` — rename Meetings → Calendar, update href
- [ ] `src/app/admin/page.tsx` — dashboard widget
- [ ] `src/lib/db/queries/dashboard.ts` — query calendar_events
- [ ] `src/app/admin/settings/page.tsx` — Google Calendar connection UI
- [ ] `src/lib/email/templates/meeting-booked.ts` — adapt for new schema
- [ ] `src/components/admin/lead-detail.tsx` — add "Schedule Meeting" button
- [ ] `src/components/admin/project-detail.tsx` — add "Schedule Meeting" button

### Deleted Files
- [ ] `src/app/api/webhooks/calcom/route.ts`
- [ ] `src/lib/db/queries/meetings.ts`
- [ ] `src/lib/types/meetings.ts`
- [ ] `src/components/admin/meetings-list.tsx`
- [ ] `src/app/admin/meetings/page.tsx`
- [ ] `src/app/admin/meetings/loading.tsx`

---

## CODING RULES REMINDER

- TypeScript strict — no `any`, use proper types
- Every file under 300 lines, every function under 50 lines
- Server Components by default, `'use client'` only for interactivity
- Lazy initialization for all SDK clients and env reads (Proxy pattern)
- All queries in `src/lib/db/queries/` — components never import Drizzle directly
- Server Actions for mutations, API routes only for public endpoints + webhooks + cron
- Rate limit all public endpoints with Upstash (lazy getter pattern)
- Zod validation on all inputs — use `.issues` not `.errors` (Zod v4)
- Admin theme: dark (navy bg #033457, green accents #03FF00)
- Mobile responsive 375px+
- Toast notifications via `sonner` (not shadcn toast)
- Audit log all admin mutations

## FINAL VERIFICATION

1. `npm run build` — zero errors
2. Google OAuth flow: Settings → Connect → Google consent → redirect back → shows connected
3. Calendar page: monthly/weekly/day views, color-coded events, click for details
4. Booking API: `GET /api/booking/available-slots?date=...` returns slots, `POST /api/booking/create` books + creates lead + sends emails
5. Create event from lead/client/project detail pages
6. Dashboard widget shows upcoming meetings
7. Cron: reminders send 24h and 4h branded emails
8. Cron: sync pulls events from Google Calendar every 30 min
9. Zero references to cal.com, calcom, Cal.com remain in codebase
10. All existing features still work: pipeline, leads, proposals, invoices, portal
