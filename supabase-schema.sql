-- ============================================
-- Botmakers.ai Database Schema
-- Run this in Supabase SQL Editor (all at once)
-- ============================================

-- 1. Admin Users
-- Tracks which Supabase Auth users are admins
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- 2. Leads
-- All lead form submissions + AI analysis
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  project_type text,
  project_timeline text,
  existing_systems text,
  referral_source text,
  preferred_contact text,
  project_details text,
  sms_consent boolean default false,
  sms_consent_timestamp timestamptz,
  sms_consent_ip text,
  sms_opted_out boolean default false,
  lead_score text default 'Medium',
  ai_internal_analysis jsonb,
  ai_prospect_summary text,
  status text not null default 'pending',
  source text not null default 'web_form',
  notes text default '',
  ip_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for common queries
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_source_idx on leads(source);
create index if not exists leads_created_at_idx on leads(created_at desc);

-- 3. Projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  client_email text not null,
  client_company text,
  client_phone text,
  project_type text,
  description text,
  status text not null default 'draft',
  linked_lead_id uuid references leads(id) on delete set null,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_idx on projects(status);
create index if not exists projects_client_email_idx on projects(client_email);

-- 4. Project Phases
create table if not exists project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  sort_order int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists project_phases_project_idx on project_phases(project_id);

-- 5. Project Milestones
create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references project_phases(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pending',
  sort_order int not null default 1,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists project_milestones_phase_idx on project_milestones(phase_id);
create index if not exists project_milestones_project_idx on project_milestones(project_id);

-- 6. Project Demos
create table if not exists project_demos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  phase_id uuid references project_phases(id) on delete set null,
  created_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists project_demos_project_idx on project_demos(project_id);

-- 7. Project Questions (Client Q&A)
create table if not exists project_questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  client_email text not null,
  question_text text not null,
  reply_text text,
  reply_draft text,
  replied_by uuid references admin_users(id) on delete set null,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists project_questions_project_idx on project_questions(project_id);

-- 8. Referrers
create table if not exists referrers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  feedback text,
  ip_address text,
  created_at timestamptz not null default now()
);

-- 9. Referrals (individual referred contacts)
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references referrers(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists referrals_referrer_idx on referrals(referrer_id);

-- ============================================
-- Auto-update updated_at timestamps
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on all tables
alter table admin_users enable row level security;
alter table leads enable row level security;
alter table projects enable row level security;
alter table project_phases enable row level security;
alter table project_milestones enable row level security;
alter table project_demos enable row level security;
alter table project_questions enable row level security;
alter table referrers enable row level security;
alter table referrals enable row level security;

-- Service role bypasses RLS, but we need policies for anon/authenticated users

-- Admin users: only the admin themselves can read their own record
create policy "Admins can read own record" on admin_users
  for select using (auth.uid() = id);

-- Leads: only admins (via service role) manage leads, no direct client access

-- Projects: clients can read their own projects by email match
create policy "Clients can read own projects" on projects
  for select using (auth.jwt() ->> 'email' = client_email);

-- Phases: clients can read phases for their projects
create policy "Clients can read own project phases" on project_phases
  for select using (
    project_id in (
      select id from projects where client_email = auth.jwt() ->> 'email'
    )
  );

-- Milestones: clients can read milestones for their projects
create policy "Clients can read own project milestones" on project_milestones
  for select using (
    project_id in (
      select id from projects where client_email = auth.jwt() ->> 'email'
    )
  );

-- Demos: clients can read demos for their projects
create policy "Clients can read own project demos" on project_demos
  for select using (
    project_id in (
      select id from projects where client_email = auth.jwt() ->> 'email'
    )
  );

-- Questions: clients can read and insert questions for their projects
create policy "Clients can read own project questions" on project_questions
  for select using (
    project_id in (
      select id from projects where client_email = auth.jwt() ->> 'email'
    )
  );

create policy "Clients can ask questions on own projects" on project_questions
  for insert with check (
    client_email = auth.jwt() ->> 'email'
    and project_id in (
      select id from projects where client_email = auth.jwt() ->> 'email'
    )
  );

-- ============================================
-- Create admin auth users and insert into admin_users table
-- We create Supabase Auth users, then register them as admins.
-- ============================================
-- NOTE: Run these one at a time if needed. The passwords below are
-- temporary — each admin should change theirs on first login.

-- Jay
select auth.create_user('{
  "email": "jay@m.botmakers.ai",
  "password": "BotMakers2025!",
  "email_confirm": true,
  "user_metadata": {"full_name": "Jay"}
}'::jsonb);

insert into admin_users (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users where email = 'jay@m.botmakers.ai'
on conflict (id) do nothing;

-- Trent
select auth.create_user('{
  "email": "tdaniel@botmakers.ai",
  "password": "BotMakers2025!",
  "email_confirm": true,
  "user_metadata": {"full_name": "Trent"}
}'::jsonb);

insert into admin_users (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users where email = 'tdaniel@botmakers.ai'
on conflict (id) do nothing;

-- Dee
select auth.create_user('{
  "email": "dessiah@m.botmakers.ai",
  "password": "BotMakers2025!",
  "email_confirm": true,
  "user_metadata": {"full_name": "Dee"}
}'::jsonb);

insert into admin_users (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users where email = 'dessiah@m.botmakers.ai'
on conflict (id) do nothing;
