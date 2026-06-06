-- Migration: Calendar ↔ CRM Integration
-- Adds columns to calendar_events for auto-logging meetings and sending follow-up emails

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS contact_logged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMPTZ;

-- Index for the post-meeting cron query (completed, unlogged events with linked lead/client)
CREATE INDEX IF NOT EXISTS calendar_events_contact_logged_at_idx
  ON calendar_events (contact_logged_at)
  WHERE contact_logged_at IS NULL;
