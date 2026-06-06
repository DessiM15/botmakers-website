-- Migration: Replace Cal.com meetings with Google Calendar integration
-- Adds Google Calendar columns to team_users, creates calendar_events + booking_settings tables

-- 1. Add Google Calendar columns to team_users
ALTER TABLE team_users
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS google_calendar_email TEXT;

-- 2. Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_event_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  meeting_link TEXT,
  attendees JSONB,
  event_type TEXT NOT NULL DEFAULT 'other',
  related_lead_id UUID REFERENCES leads(id),
  related_project_id UUID REFERENCES projects(id),
  related_client_id UUID REFERENCES clients(id),
  booked_by_name TEXT,
  booked_by_email TEXT,
  booked_by_phone TEXT,
  booked_by_company TEXT,
  reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_4h_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES team_users(id),
  google_calendar_id TEXT,
  google_html_link TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calendar_events_start_time_idx ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS calendar_events_google_event_id_idx ON calendar_events(google_event_id);
CREATE INDEX IF NOT EXISTS calendar_events_lead_id_idx ON calendar_events(related_lead_id);
CREATE INDEX IF NOT EXISTS calendar_events_client_id_idx ON calendar_events(related_client_id);
CREATE INDEX IF NOT EXISTS calendar_events_project_id_idx ON calendar_events(related_project_id);
CREATE INDEX IF NOT EXISTS calendar_events_booked_by_email_idx ON calendar_events(booked_by_email);

-- 3. Create booking_settings table (single-row config)
CREATE TABLE IF NOT EXISTS booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  available_days JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
  available_start_time TEXT NOT NULL DEFAULT '09:00',
  available_end_time TEXT NOT NULL DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  max_advance_days INTEGER NOT NULL DEFAULT 30,
  team_emails JSONB NOT NULL DEFAULT '["jay@m.botmakers.ai","dessiah@m.botmakers.ai","trent@botmakers.ai"]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Seed booking_settings with default row
INSERT INTO booking_settings (id) VALUES (gen_random_uuid())
  ON CONFLICT DO NOTHING;

-- 5. Migrate existing meetings data to calendar_events (preserve history)
INSERT INTO calendar_events (
  title, description, start_time, end_time,
  meeting_link, attendees, event_type,
  related_lead_id, related_project_id, related_client_id,
  booked_by_name, booked_by_email,
  created_by, created_at, updated_at
)
SELECT
  title, description, start_time, end_time,
  meeting_url,
  CASE WHEN attendee_email IS NOT NULL
    THEN jsonb_build_array(jsonb_build_object('email', attendee_email, 'name', COALESCE(attendee_name, '')))
    ELSE NULL
  END,
  'discovery_call',
  lead_id, project_id, client_id,
  attendee_name, attendee_email,
  created_by, created_at, updated_at
FROM meetings
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings');

-- 6. Drop old meetings table and enums
DROP TABLE IF EXISTS meetings CASCADE;
DROP TYPE IF EXISTS meeting_source CASCADE;
DROP TYPE IF EXISTS meeting_status CASCADE;

-- 7. RLS policies for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view calendar events" ON calendar_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND team_users.is_active = TRUE
    )
  );

CREATE POLICY "Team can insert calendar events" ON calendar_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND team_users.is_active = TRUE
    )
  );

CREATE POLICY "Team can update calendar events" ON calendar_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND team_users.is_active = TRUE
    )
  );

-- 8. RLS policies for booking_settings
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team can view booking settings" ON booking_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND team_users.is_active = TRUE
    )
  );

CREATE POLICY "Admins can update booking settings" ON booking_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND team_users.role = 'admin'
    )
  );

-- 9. Service role bypass for cron jobs and API routes
CREATE POLICY "Service role full access calendar_events" ON calendar_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access booking_settings" ON booking_settings
  FOR ALL USING (auth.role() = 'service_role');
