-- Migration: Add meetings table for Cal.com integration
-- Adds meeting_status enum, meeting_booked notification type, and meetings table

-- Create meeting_status enum
CREATE TYPE meeting_status AS ENUM ('scheduled', 'rescheduled', 'cancelled', 'completed');

-- Add meeting_booked to notification_type enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'meeting_booked';

-- Create meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calcom_booking_uid TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  meeting_url TEXT,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_timezone TEXT,
  organizer_name TEXT,
  organizer_email TEXT,
  related_lead_id UUID REFERENCES leads(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX meetings_calcom_booking_uid_idx ON meetings(calcom_booking_uid);
CREATE INDEX meetings_start_time_idx ON meetings(start_time);
CREATE INDEX meetings_status_idx ON meetings(status);
CREATE INDEX meetings_related_lead_id_idx ON meetings(related_lead_id);
CREATE INDEX meetings_attendee_email_idx ON meetings(attendee_email);

-- RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Team members can read all meetings
CREATE POLICY "team_read_meetings" ON meetings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND team_users.is_active = true
    )
  );

-- Team members can insert/update meetings
CREATE POLICY "team_write_meetings" ON meetings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND team_users.is_active = true
    )
  );

CREATE POLICY "team_update_meetings" ON meetings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_users
      WHERE team_users.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND team_users.is_active = true
    )
  );

-- Service role bypasses RLS (for webhook inserts)
CREATE POLICY "service_role_all_meetings" ON meetings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
