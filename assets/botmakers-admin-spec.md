# Botmakers.ai Admin Dashboard & Client Portal
# CLAUDE CODE BUILD SPEC — Feed one chunk at a time

---

## HOW TO USE THIS SPEC

This build is broken into **6 self-contained chunks**. Feed them to Claude Code **one at a time, in order**. Each chunk lists:
- **WHAT EXISTS** — files already in the codebase (don't recreate)
- **WHAT TO BUILD** — exact files to create with descriptions
- **DATABASE** — exact SQL to run for that chunk
- **API ROUTES** — endpoints to build
- **DO NOT TOUCH** — files to leave alone
- **VERIFY** — how to confirm the chunk works

After each chunk builds successfully, commit and move to the next.

---

## PREREQUISITE: EXISTING CODEBASE CONTEXT

Tell Claude Code this at the START of every chunk session:

> "This is a Next.js 16 project using React 19, Tailwind 4, TypeScript, deployed on Vercel. The project already has:
> - A lead capture form at /#project-form (POST /api/leads)
> - A referral system at /refer (POST /api/referrals)
> - Email sending via Resend (src/lib/email.ts, src/lib/referral-email.ts)
> - Claude AI analysis (src/lib/ai.ts)
> - Rate limiting via Upstash (src/lib/rate-limit.ts)
> - In-memory storage (src/lib/supabase.ts) — being replaced with real Supabase
> - Brand: navy #033457, green #03FF00, Inter Tight font
> - Team emails: jay@m.botmakers.ai, tdaniel@botmakers.ai, dessiah@m.botmakers.ai"

---

## CHUNK 1: SUPABASE FOUNDATION + AUTH

**Goal:** Replace in-memory storage with Supabase. Set up admin auth. Build login page.

### WHAT EXISTS (don't recreate)
- `src/lib/supabase.ts` — in-memory store (REPLACE this file)
- `src/lib/types.ts` — existing types
- `src/app/api/leads/route.ts` — lead form handler (UPDATE to use Supabase)
- `src/app/api/referrals/route.ts` — referral handler (UPDATE to use Supabase)
- `src/app/admin/email-preview/page.tsx` — existing admin page (KEEP)

### DATABASE — Run this SQL in Supabase SQL Editor

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Admin users table
create table admin_users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  full_name text not null,
  created_at timestamptz default now()
);

-- Update existing leads table (add columns if table exists, or create full table)
-- If leads table doesn't exist yet, create it:
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  project_type text,
  project_timeline text,
  existing_systems text,
  referral_source text,
  preferred_contact text default 'email',
  project_details text,
  sms_consent boolean default false,
  sms_consent_timestamp timestamptz,
  sms_consent_ip text,
  sms_opted_out boolean default false,
  lead_score text,
  ai_internal_analysis jsonb,
  ai_prospect_summary text,
  status text default 'pending',
  source text default 'web_form',
  referred_by uuid,
  referral_email_sent boolean default false,
  referral_email_sent_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Referrers table
create table if not exists referrers (
  id uuid primary key default uuid_generate_v4(),
  slug text unique,
  full_name text not null,
  email text not null,
  company text,
  feedback text,
  ai_feedback_analysis jsonb,
  total_referrals integer default 0,
  from_param text,
  ip_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  client_name text not null,
  client_email text not null,
  client_company text,
  client_phone text,
  project_type text not null,
  description text,
  status text default 'draft',
  linked_lead_id uuid references leads(id),
  created_by uuid references admin_users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project phases
create table project_phases (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  sort_order integer not null,
  created_at timestamptz default now()
);

-- Project milestones
create table project_milestones (
  id uuid primary key default uuid_generate_v4(),
  phase_id uuid references project_phases(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending',
  sort_order integer not null,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Project demos
create table project_demos (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  phase_id uuid references project_phases(id),
  created_by uuid references admin_users(id),
  created_at timestamptz default now()
);

-- Project questions
create table project_questions (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  client_email text not null,
  question_text text not null,
  reply_text text,
  reply_draft text,
  replied_by uuid references admin_users(id),
  replied_at timestamptz,
  created_at timestamptz default now()
);

-- RLS Policies
alter table admin_users enable row level security;
alter table leads enable row level security;
alter table referrers enable row level security;
alter table projects enable row level security;
alter table project_phases enable row level security;
alter table project_milestones enable row level security;
alter table project_demos enable row level security;
alter table project_questions enable row level security;

-- Admin can do everything
create policy "Admins full access" on leads for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins full access" on referrers for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins full access" on projects for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins full access" on project_phases for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins full access" on project_milestones for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins full access" on project_demos for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins full access" on project_questions for all using (
  auth.uid() in (select id from admin_users)
);
create policy "Admins read" on admin_users for select using (
  auth.uid() in (select id from admin_users)
);

-- Clients can view their own projects
create policy "Clients view own projects" on projects for select using (
  client_email = auth.jwt()->>'email'
);
create policy "Clients view own phases" on project_phases for select using (
  project_id in (select id from projects where client_email = auth.jwt()->>'email')
);
create policy "Clients view own milestones" on project_milestones for select using (
  project_id in (select id from projects where client_email = auth.jwt()->>'email')
);
create policy "Clients view own demos" on project_demos for select using (
  project_id in (select id from projects where client_email = auth.jwt()->>'email')
);
create policy "Clients view own questions" on project_questions for select using (
  project_id in (select id from projects where client_email = auth.jwt()->>'email')
);
create policy "Clients ask questions" on project_questions for insert with check (
  project_id in (select id from projects where client_email = auth.jwt()->>'email')
);
```

### WHAT TO BUILD

**`src/lib/supabase-server.ts`** — Supabase server client using service role key
```
import { createClient } from '@supabase/supabase-js'
Uses: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars
Export: supabaseAdmin (singleton)
```

**`src/lib/supabase-browser.ts`** — Supabase browser client using anon key
```
import { createClient } from '@supabase/supabase-js'
Uses: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
Export: supabase (singleton)
```

**`src/lib/auth.ts`** — Auth helper functions
```
getAdminUser(request): Check Supabase Auth session, verify user is in admin_users table. Return user or null.
getClientUser(request): Check Supabase Auth session. Return user or null.
requireAdmin(request): Call getAdminUser, throw 401 if null.
requireClient(request): Call getClientUser, throw 401 if null.
```

**`src/middleware.ts`** — Next.js middleware for route protection
```
Match /admin/* (except /admin/login): redirect to /admin/login if no session
Match /portal/* (except /portal/login): redirect to /portal/login if no session
```

**`src/app/admin/login/page.tsx`** — Admin login page
```
Client component. Email + password form.
On submit: call Supabase Auth signInWithPassword.
On success: redirect to /admin.
Styling: centered card on dark bg, Botmakers branding (navy/green).
```

**`src/app/admin/layout.tsx`** — Admin layout with sidebar
```
Server component. Check auth (redirect if not admin).
Sidebar with links: Dashboard, Leads, Referrals, Projects, Email Preview, Logout.
Active link highlighting. Botmakers branding.
Sidebar collapses to hamburger on mobile.
```

**UPDATE `src/lib/supabase.ts`** — Replace in-memory with Supabase
```
Replace insertLead/updateLead/getLeadById to use supabaseAdmin from supabase-server.ts.
Insert into 'leads' table. Update with .update(). Get with .select().single().
```

**UPDATE `src/app/api/leads/route.ts`** — Use real Supabase
```
Replace in-memory leadStore references with Supabase calls.
Store AI analysis as JSONB in ai_internal_analysis column.
```

**UPDATE `src/app/api/referrals/route.ts`** — Use real Supabase
```
Replace in-memory referralSubmissions with Supabase.
Upsert into referrers table. Insert each referral into leads table with source: 'referral'.
```

### INSTALL
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### ENV VARS NEEDED
```
NEXT_PUBLIC_SUPABASE_URL=<from dad>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from dad>
SUPABASE_SERVICE_ROLE_KEY=<from dad>
```

### DO NOT TOUCH
- src/components/* (existing site components)
- src/lib/email.ts, src/lib/referral-email.ts (email functions)
- src/lib/ai.ts (AI analysis)
- src/lib/rate-limit.ts (rate limiting)
- src/app/refer/* (referral page)
- src/app/page.tsx (homepage)
- Any public/ assets

### VERIFY
1. `npm run build` passes
2. Admin login at /admin/login works
3. Non-admin users redirected from /admin to /admin/login
4. Lead form submission stores in Supabase leads table
5. Referral submission stores in Supabase referrers + leads tables

---

## CHUNK 2: ADMIN — LEADS & REFERRALS PAGES

**Goal:** Build the leads management and referrals views in the admin dashboard.

### WHAT EXISTS (from Chunk 1)
- `src/app/admin/layout.tsx` — admin layout with sidebar
- `src/lib/supabase-server.ts` — Supabase server client
- `src/lib/auth.ts` — auth helpers (requireAdmin)
- `src/lib/types.ts` — existing lead types
- Supabase `leads` table with data from form submissions
- Supabase `referrers` table with data from referral submissions

### WHAT TO BUILD

**`src/app/api/admin/leads/route.ts`** — GET: List leads
```
requireAdmin(request).
Query leads table with:
- Pagination: ?page=1&limit=20
- Filters: ?source=web_form, ?status=pending, ?score=high
- Search: ?search=john (matches name or email, case-insensitive)
- Sort: ?sort=created_at&order=desc
Return: { leads: [...], total: count, page, limit }
```

**`src/app/api/admin/leads/[id]/route.ts`** — GET + PATCH
```
GET: requireAdmin. Return single lead with all fields.
PATCH: requireAdmin. Update status, notes. Set updated_at.
```

**`src/app/api/admin/leads/[id]/convert/route.ts`** — POST: Convert lead to project
```
requireAdmin.
1. Get lead data
2. Create project record (client_name=lead.full_name, client_email=lead.email, etc.)
3. Create 4 default phases with default milestones (see DEFAULT_PHASES below)
4. Update lead status to 'converted'
5. Return project id
```

**`src/app/api/admin/referrals/route.ts`** — GET: List referrals
```
requireAdmin.
Query referrers table joined with leads where source='referral'.
Return referrers with their referred contacts nested.
```

**`src/app/api/admin/metrics/route.ts`** — GET: Dashboard metrics
```
requireAdmin.
Return: {
  leadsThisWeek: count,
  leadsLastWeek: count,
  leadsThisMonth: count,
  sourceBreakdown: { web_form: n, referral: n, vapi: n },
  activeProjects: count,
  projectsByPhase: { discovery: n, mvp: n, revision: n, launch: n }
}
```

**`src/components/admin/LeadTable.tsx`** — Client component
```
Fetches from /api/admin/leads with filter/search/sort params.
Table with columns: Name (link), Email, Source (badge), Lead Score (badge), Status (dropdown), Project Type, Date, Actions.
Source badges: web_form=blue, referral=green, vapi=purple.
Score badges: High=green, Medium=yellow, Low=gray.
Status dropdown saves immediately via PATCH.
Pagination at bottom.
Search bar + filter dropdowns at top.
```

**`src/components/admin/MetricsCards.tsx`** — Client component
```
Fetches from /api/admin/metrics.
4 cards in a grid: Leads This Week (with +/- vs last week), Leads This Month, Source Breakdown (simple bar), Active Projects.
Style: bg-white/5, border-white/10, green accent for positive numbers.
```

**`src/components/admin/ActivityFeed.tsx`** — Client component
```
Fetches last 10 leads + referrals ordered by created_at desc.
Each entry: icon (color-coded by type), description, relative time.
Link to detail page.
```

**`src/app/admin/page.tsx`** — Dashboard home
```
Server component (auth check).
Render: MetricsCards, Quick Actions (Create Project button, View Leads link), ActivityFeed.
```

**`src/app/admin/leads/page.tsx`** — Leads list page
```
Server component (auth check).
Render: page title "Leads", LeadTable component.
```

**`src/app/admin/leads/[id]/page.tsx`** — Lead detail page
```
Server component. Fetch lead by ID.
Display: all form fields, AI analysis (formatted), status dropdown, notes textarea (saves on blur).
"Convert to Project" button (calls /api/admin/leads/[id]/convert, redirects to project).
Communication history section (future).
```

**`src/app/admin/referrals/page.tsx`** — Referrals page
```
Server component. Fetch referrers with their referrals.
Expandable referrer cards showing: name, email, company, feedback, count.
Expand shows: referred contacts table with name, email, phone, company, status.
```

### DEFAULT_PHASES constant (put in src/lib/types.ts)
```typescript
export const DEFAULT_PROJECT_PHASES = [
  { name: "Discovery", sort_order: 1, milestones: [
    "Initial consultation completed",
    "Requirements documented",
    "Project plan approved"
  ]},
  { name: "MVP Build", sort_order: 2, milestones: [
    "Development environment setup",
    "Core features implemented",
    "Internal testing passed"
  ]},
  { name: "Revision", sort_order: 3, milestones: [
    "Client feedback collected",
    "Revisions implemented",
    "Final testing passed"
  ]},
  { name: "Launch", sort_order: 4, milestones: [
    "Deployment completed",
    "Client training done",
    "Project handoff complete"
  ]}
];
```

### DO NOT TOUCH
- src/app/api/leads/route.ts (public lead form handler — different from admin leads API)
- src/app/api/referrals/route.ts (public referral form handler)
- src/components/LeadForm.tsx, ReferralForm.tsx (public forms)
- src/app/refer/*, src/app/page.tsx

### VERIFY
1. /admin shows metrics cards with real data from Supabase
2. /admin/leads shows all leads with working filters, search, sort
3. Lead detail shows AI analysis and allows status/notes updates
4. /admin/referrals shows referrers with expandable referral lists
5. "Convert to Project" creates a project with 4 phases and 12 milestones

---

## CHUNK 3: ADMIN — PROJECT MANAGEMENT

**Goal:** Build project creation, milestone management, demo links, and client Q&A in admin.

### WHAT EXISTS (from Chunks 1-2)
- Admin auth, layout, sidebar
- Supabase tables: projects, project_phases, project_milestones, project_demos, project_questions
- DEFAULT_PROJECT_PHASES in types.ts
- /api/admin/leads/[id]/convert (creates projects)

### WHAT TO BUILD

**`src/app/api/admin/projects/route.ts`** — GET + POST
```
GET: requireAdmin. List all projects with progress stats (join phases/milestones, calculate %).
POST: requireAdmin. Create project. Auto-create 4 default phases + milestones. If client_email is new, create Supabase Auth user and send welcome email.
```

**`src/app/api/admin/projects/[id]/route.ts`** — GET + PATCH
```
GET: Return project with phases (with milestones nested), demos, questions.
PATCH: Update project name, status, description, client info.
```

**`src/app/api/admin/projects/[id]/phases/route.ts`** — POST: Add phase
**`src/app/api/admin/projects/[id]/phases/[phaseId]/route.ts`** — PATCH + DELETE

**`src/app/api/admin/projects/[id]/milestones/route.ts`** — POST: Add milestone
**`src/app/api/admin/projects/[id]/milestones/[milestoneId]/route.ts`** — PATCH + DELETE
```
PATCH: When status changes to 'completed', set completed_at=now() and trigger milestone email to client.
```

**`src/app/api/admin/projects/[id]/demos/route.ts`** — POST: Add demo link
```
Insert into project_demos. Trigger demo notification email to client.
```
**`src/app/api/admin/projects/[id]/demos/[demoId]/route.ts`** — DELETE

**`src/app/api/admin/projects/[id]/questions/route.ts`** — GET: List questions
**`src/app/api/admin/projects/[id]/questions/[questionId]/reply/route.ts`** — POST
```
Accept: { draft: string, polished?: boolean }
If polished=false: call /api/ai/polish-reply, return polished text (don't send yet).
If polished=true: save reply_text, set replied_at, trigger reply email to client.
```

**`src/app/api/ai/polish-reply/route.ts`** — POST: AI polishes team reply
```
requireAdmin.
Send to Claude: system prompt + client question + team draft.
Claude returns polished, professional version.
Temperature: 0.5.
Model: claude-sonnet-4-5-20250929.
```

**`src/lib/project-emails.ts`** — 4 email functions
```
sendMilestoneCompletedEmail(project, milestone): "Project Update: {title} is complete!"
sendDemoSharedEmail(project, demo): "New demo available for {project}"
sendQuestionRepliedEmail(project, question): "Re: Your question about {project}"
sendWelcomeEmail(project): "Welcome — Your Project Portal"

All from info@botmakers.ai via Resend. Botmakers branding. Include portal CTA link.
Follow same pattern as src/lib/email.ts (getResendClient with fallback).
```

**`src/components/admin/MilestoneEditor.tsx`** — Client component
```
Displays phases as collapsible sections.
Each phase: name (editable), milestones list.
Each milestone: title, status dropdown (pending/in_progress/completed), delete button.
Add milestone button per phase. Add phase button.
Drag-to-reorder milestones (or up/down arrows for simplicity).
Status change to 'completed' shows confirmation: "Mark as complete? Client will be notified."
```

**`src/components/admin/DemoLinkForm.tsx`** — Client component
```
Form: title, URL, description (optional), phase dropdown.
Submit creates demo + triggers email.
List of existing demos with delete buttons.
```

**`src/components/admin/QuestionReply.tsx`** — Client component
```
Shows questions list (newest first).
Each: question text, date, status (pending/replied).
Reply flow:
1. Team types in textarea
2. Clicks "Polish with AI" — calls /api/ai/polish-reply, shows polished version
3. Team can edit the polished version
4. Clicks "Send Reply" — calls reply endpoint, sends email
```

**`src/app/admin/projects/page.tsx`** — Projects list
```
Table: name, client, status badge, current phase, progress bar, date, actions.
"Create New Project" button.
```

**`src/app/admin/projects/new/page.tsx`** — Create project form
```
Form fields: name, client name, client email, client company, client phone, project type dropdown, description.
Pre-populated if query param ?lead_id= is present (from Convert to Project).
Submit creates project + default phases/milestones.
```

**`src/app/admin/projects/[id]/page.tsx`** — Project detail
```
Tabbed interface: Overview | Milestones | Demos | Questions
Overview: project info, status dropdown, progress bar, client details.
Milestones: MilestoneEditor component.
Demos: DemoLinkForm component.
Questions: QuestionReply component.
```

### DO NOT TOUCH
- Everything in Chunks 1-2 that's already working
- Public-facing pages and APIs

### VERIFY
1. Create a project from /admin/projects/new — 4 phases + 12 milestones auto-created
2. Convert a lead to project — project pre-populated with lead data
3. Mark a milestone complete — client email sent
4. Add a demo link — client email sent
5. Reply to a question with AI polish — polished text returned, then email sent on confirm

---

## CHUNK 4: CLIENT PORTAL

**Goal:** Build the client-facing portal with magic link auth, project view, and Q&A.

### WHAT EXISTS (from Chunks 1-3)
- Supabase Auth system
- All project data tables with RLS policies
- Project notification emails
- Projects with phases, milestones, demos, questions in Supabase

### WHAT TO BUILD

**`src/app/api/portal/auth/magic-link/route.ts`** — POST
```
Accept: { email }
Call Supabase Auth signInWithOtp({ email, options: { emailRedirectTo: '/portal' } }).
If email not found in any project's client_email, return error.
Return success message.
```

**`src/app/api/portal/auth/logout/route.ts`** — POST
```
Destroy Supabase session. Redirect to /portal/login.
```

**`src/app/api/portal/projects/route.ts`** — GET
```
requireClient. RLS filters automatically.
Return client's projects with progress stats.
```

**`src/app/api/portal/projects/[id]/route.ts`** — GET
```
requireClient. RLS ensures client only sees own project.
Return: project + phases (with milestones nested) + demos + questions.
```

**`src/app/api/portal/projects/[id]/questions/route.ts`** — POST
```
requireClient. RLS ensures client can only submit to own project.
Insert question. Notify team via email (to Jay, Dad, Dee).
```

**`src/app/portal/login/page.tsx`** — Magic link login
```
Centered card on white bg. Botmakers logo at top.
"Client Portal" heading.
Email input + "Send Login Link" button.
After submit: "Check your email for a login link."
Error if email not found.
Styling: clean, white bg, navy accents, minimal.
```

**`src/app/portal/layout.tsx`** — Portal layout
```
White/light background.
PortalHeader at top.
Auth guard: redirect to /portal/login if no session.
No sidebar — simple centered content.
Max-width container (max-w-5xl).
```

**`src/components/portal/PortalHeader.tsx`**
```
Botmakers logo (small), client name from session, Logout button.
Clean horizontal bar. White bg with subtle bottom border.
```

**`src/app/portal/page.tsx`** — Portal home
```
If 1 project: redirect to /portal/projects/[id].
If multiple: show project cards with name, status, progress bar, "View" button.
If 0: "No active projects. Contact info@botmakers.ai."
```

**`src/app/portal/projects/[id]/page.tsx`** — Project view
```
Sections stacked vertically:
1. Project header (name, type, status badge)
2. ProgressBar component
3. MilestoneChecklist component
4. DemoGallery component
5. QuestionForm component
```

**`src/components/portal/ProgressBar.tsx`**
```
Full-width bar. Green fill proportional to completion %.
"{n}% Complete" label. "Phase {x} of {y}: {name}" subtitle.
```

**`src/components/portal/MilestoneChecklist.tsx`**
```
Grouped by phase. Phase headers as collapsible sections.
Icons: ✅ completed (green), 🔵 in_progress (blue), ⚪ pending (gray).
Completed shows date. Current phase expanded. Future grayed out.
```

**`src/components/portal/DemoGallery.tsx`**
```
Cards: title, description, date, "View Demo →" button (opens new tab).
Empty: "No demos available yet."
```

**`src/components/portal/QuestionForm.tsx`**
```
"Have a Question?" heading.
Textarea + "Submit Question" button.
Below: Q&A list (newest first).
Each: question text, date, reply (or "Our team is reviewing..."), reply date.
```

### DESIGN RULES FOR PORTAL
- White/light gray background (#F9FAFB or white)
- Navy (#033457) for headings and accents
- Green (#03FF00) for progress bars, success states, CTAs
- Inter Tight font (already loaded globally)
- Clean, lots of whitespace, no clutter
- Mobile-first responsive

### DO NOT TOUCH
- All /admin/* pages and APIs
- Public site pages
- Email templates (use existing project-emails.ts functions)

### VERIFY
1. Client enters email at /portal/login, receives magic link email
2. Click magic link → authenticated → redirected to /portal
3. Client sees their project with progress bar and milestones
4. Client sees demo links shared by team
5. Client submits a question → team gets email notification
6. Client CANNOT see other clients' projects (test with different email)

---

## CHUNK 5: EMAIL NOTIFICATION WIRING

**Goal:** Ensure all automatic emails fire correctly from admin actions.

### WHAT EXISTS (from Chunks 1-4)
- `src/lib/project-emails.ts` (4 email functions from Chunk 3)
- All admin API routes
- All portal pages

### WHAT TO VERIFY / FIX

Check that these admin actions trigger the correct email:

1. **Marking milestone complete** (`PATCH /api/admin/projects/[id]/milestones/[mid]` with status=completed)
   → Calls `sendMilestoneCompletedEmail(project, milestone)`
   → Email arrives at client_email with milestone title, progress %, portal link

2. **Adding demo link** (`POST /api/admin/projects/[id]/demos`)
   → Calls `sendDemoSharedEmail(project, demo)`
   → Email arrives at client_email with demo title, view demo link, portal link

3. **Replying to question** (`POST /api/admin/projects/[id]/questions/[qid]/reply` with polished=true)
   → Calls `sendQuestionRepliedEmail(project, question)`
   → Email arrives at client_email with question, reply, portal link

4. **Creating project with new client** (`POST /api/admin/projects`)
   → If client_email doesn't have a Supabase Auth account, create one
   → Calls `sendWelcomeEmail(project)`
   → Email arrives with welcome message and magic link

5. **Client submits question** (`POST /api/portal/projects/[id]/questions`)
   → Send notification to team (Jay, Dad, Dee) that a new question was submitted
   → Email: "[Client Question] {client_name} asked about {project_name}"

### DO NOT TOUCH
- Public-facing form emails (leads, referrals)

### VERIFY
- Test each of the 5 flows above end-to-end
- Check emails arrive in inbox (not just spam)
- Verify email links point to correct portal URLs

---

## CHUNK 6: POLISH & TESTING

**Goal:** Final QA, mobile responsiveness, and edge cases.

### CHECKLIST

**Admin:**
- [ ] Login/logout works
- [ ] Dashboard shows correct metrics
- [ ] Leads table filters, searches, sorts correctly
- [ ] Lead detail shows full AI analysis
- [ ] Lead status updates save
- [ ] Lead notes save
- [ ] Convert to Project creates project with phases/milestones
- [ ] Referrals page shows referrers with expandable contacts
- [ ] Projects list shows all projects with progress bars
- [ ] Create standalone project works
- [ ] Milestone editor: add, edit, reorder, complete, delete
- [ ] Demo links: add, delete
- [ ] Q&A: view questions, write reply, AI polish, send
- [ ] All admin pages mobile responsive
- [ ] Sidebar collapses on mobile

**Portal:**
- [ ] Magic link login flow works end-to-end
- [ ] Single project → auto-redirect to project view
- [ ] Multiple projects → shows project cards
- [ ] Progress bar accurate
- [ ] Milestone checklist displays correctly with phase grouping
- [ ] Demo gallery shows links
- [ ] Question form submits and shows in Q&A list
- [ ] Client cannot access other clients' data (RLS)
- [ ] Portal is mobile responsive
- [ ] Clean logout redirects to login

**Emails:**
- [ ] Milestone completed email arrives
- [ ] Demo shared email arrives
- [ ] Question reply email arrives
- [ ] Welcome email arrives with working magic link
- [ ] Team notification for client question arrives

**Security:**
- [ ] Non-admin cannot access /admin/*
- [ ] Non-client cannot access /portal/*
- [ ] Client cannot see other clients' projects via API
- [ ] Service role key not exposed client-side

### THEN
```bash
npm run build
git add -A
git commit -m "Complete admin dashboard and client portal"
git push
```
Deploy on Vercel. Add any new env vars to Vercel dashboard.
