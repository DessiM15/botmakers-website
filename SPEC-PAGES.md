# SPEC-PAGES.md — Botmakers CRM v1

---

## PUBLIC PAGES

### `/` — Homepage
- **Purpose:** Marketing landing page for Botmakers.ai
- **Status:** EXISTING — do not rebuild. Only add "Team Login" link in footer and verify "Client Portal" link exists.
- **SEO:** Title: "Botmakers.ai — AI-Accelerated Software Development"

### `/about` — About Page
- **Status:** EXISTING — do not modify.

### `/refer` — Referral Form
- **Status:** EXISTING — do not modify. Update storage to Supabase (Stage 1).

---

## AUTH PAGES

### `/admin/login` — Team Login
- **Purpose:** Email + password login for CRM team
- **UI Sections:**
  - Centered card on dark background (#033457)
  - Botmakers logo (white/green)
  - "Team Login" heading
  - Email input (required, email format)
  - Password input (required, min 8)
  - "Sign In" button (green #03FF00)
  - Error message area (red text, below button)
- **Loading State:** Button shows spinner, inputs disabled during auth
- **Error States:** "Invalid email or password", "Account disabled — contact admin", "Too many attempts — try again in 15 minutes"
- **Mobile:** Full-width card below 768px, card max-w-md centered above

### `/portal/login` — Client Portal Login
- **Purpose:** Magic link email entry for clients
- **UI Sections:**
  - Centered card on light background (#F9FAFB)
  - Botmakers logo (full color)
  - "Client Portal" heading
  - Email input (required, email format)
  - "Send Login Link" button (green)
  - After submit: swap form for "Check your email for a login link. It expires in 1 hour."
- **Error States:** "No account found with that email — contact info@botmakers.ai", rate limit message
- **Mobile:** Same as desktop, responsive card

---

## CRM PAGES (/admin/*)

### `/admin` — CRM Dashboard
- **Purpose:** Overview of business health — metrics, activity, alerts
- **UI Sections:**
  1. **Greeting bar:** "Good [morning/afternoon], [name]" + date
  2. **Metrics cards** (4-column grid, 1-col mobile):
     - Leads This Week (number + delta arrow vs last week)
     - Pipeline Value (sum of proposal amounts in stages 5-7)
     - Active Projects (count + status breakdown)
     - Revenue This Month (sum of payments.amount this month)
  3. **Alerts panel** (orange/red cards):
     - Stale leads (not contacted in X days)
     - Overdue milestones (past due_date)
     - Pending questions (unanswered > 24hrs)
  4. **Recent activity feed** (last 15 events from activity_log):
     - Icon + text + relative timestamp
     - Link to entity detail
  5. **Quick actions bar:**
     - "Create Lead" → /admin/leads/new
     - "Create Project" → /admin/projects/new
     - "Create Proposal" → /admin/proposals/new
- **Loading:** Skeleton cards, skeleton activity rows
- **Empty:** "Welcome to Botmakers CRM! Start by adding your first lead." with CTA
- **Mobile:** Cards stack 1-col, activity feed below

### `/admin/pipeline` — Pipeline Board
- **Purpose:** Kanban board of all leads across 10 pipeline stages
- **UI Sections:**
  1. **Board header:** Title "Pipeline" + total leads count + filter dropdowns (source, score, assigned)
  2. **10 columns** (horizontal scroll on desktop, swipe on mobile):
     - Each column: stage name, lead count, colored header
     - Each card: lead name, company, source badge, score badge, days in stage
     - Drag-and-drop between columns (updates pipeline_stage)
  3. **Click card** → opens lead detail panel (slide-over) or navigates to /admin/leads/[id]
- **Loading:** Skeleton columns
- **Empty column:** "No leads in this stage"
- **Mobile:** Horizontal swipe columns, simplified cards
- **SEO:** noindex

### `/admin/leads` — Leads List
- **Purpose:** Filterable/sortable table of all leads
- **UI Sections:**
  1. **Header:** "Leads" + count + "Add Lead" button
  2. **Filter bar:** Search (debounced 300ms), source dropdown, score dropdown, stage dropdown, assigned dropdown
  3. **Table:** Name (link), Email, Phone, Source (badge), Score (badge), Stage (inline dropdown), Assigned To, Created (relative)
  4. **Pagination:** Page numbers + prev/next
- **Loading:** Skeleton table rows
- **Empty:** "No leads yet. They'll appear here when someone fills out the contact form or you add one manually."
- **Mobile:** Table scrolls horizontally or converts to card layout

### `/admin/leads/[id]` — Lead Detail
- **Purpose:** Full lead view with AI analysis, contact history, actions
- **UI Sections:**
  1. **Header:** Name, company, stage badge, score badge, source badge, "Back to Leads" link
  2. **Contact info card:** Email, phone, preferred contact, company, project type, timeline
  3. **Pipeline stage selector:** Visual stage progression (10 dots/steps), click to change
  4. **AI Analysis panel** (collapsible):
     - Lead score, project summary, complexity, estimated effort
     - Key questions, red flags, recommended next step
     - Prospect summary (what was sent to them)
  5. **Notes:** Textarea, auto-saves on blur
  6. **Contact log:** Timeline of all touchpoints (from contacts table)
  7. **Actions panel:**
     - "Convert to Client" button (prominent, green) — visible if not converted
     - "Create Proposal" button
     - "Log Contact" button (opens modal: type, subject, body, direction)
  8. **Assigned to:** Dropdown to assign/reassign to team member
- **Loading:** Full-page skeleton
- **Error:** "Lead not found" with back link
- **Mobile:** Stacked sections, full-width cards

### `/admin/referrals` — Referrals List
- **Purpose:** View referrers and their referred contacts
- **UI Sections:**
  1. **Header:** "Referrals" + total referrers count
  2. **Referrer cards** (expandable):
     - Card header: Name, email, company, total referrals, feedback excerpt, date
     - Expanded: table of referred leads — name, email, status badge, link to lead detail
- **Loading:** Skeleton cards
- **Empty:** "No referrals yet."
- **Mobile:** Cards full-width

### `/admin/clients` — Clients List
- **Purpose:** All clients with project/invoice summary
- **UI Sections:**
  1. **Header:** "Clients" + count + "Add Client" button
  2. **Table:** Name (link), Company, Email, Projects (count), Open Invoices ($), Last Contact (relative)
  3. **Search** + status filter
- **Loading:** Skeleton rows
- **Empty:** "No clients yet. Convert a lead or add a client manually."

### `/admin/clients/[id]` — Client Detail
- **Purpose:** Full client view with all related data
- **UI Sections:**
  1. **Header:** Name, company, email, phone
  2. **Tabs:** Overview | Projects | Proposals | Invoices | Questions | Activity
  3. **Overview tab:** Contact info edit form, notes, portal access status
  4. **Projects tab:** List of client's projects with status + progress
  5. **Proposals tab:** List of proposals with status badges
  6. **Invoices tab:** List of invoices with status + amounts
  7. **Questions tab:** Q&A across all projects
  8. **Activity tab:** Contact log + activity_log entries for this client

### `/admin/projects` — Projects List
- **Purpose:** All projects with progress and status
- **UI Sections:**
  1. **Header:** "Projects" + count + "New Project" button
  2. **Filter bar:** Status dropdown, client dropdown, search
  3. **Project cards** (grid):
     - Name, client name, status badge, progress bar (% milestones complete)
     - Current phase, last activity date
     - Click → /admin/projects/[id]
- **Loading:** Skeleton cards
- **Empty:** "No projects yet. Create your first project to get started."

### `/admin/projects/new` — Create Project
- **Purpose:** New project form (standalone or from lead conversion)
- **UI Sections:**
  1. **Form:** Project name, client (dropdown of existing or create new), project type, description, pricing type, total value, start date, target end date
  2. **If ?lead_id query param:** Pre-populate from lead data
  3. **If ?client_id query param:** Pre-select client
  4. **Phase template:** Shows default 4 phases + 12 milestones, editable before creation
  5. **Submit:** Creates project + phases + milestones, redirects to detail
- **Validation:** Name required, client required

### `/admin/projects/[id]` — Project Detail
- **Purpose:** Full project management — milestones, repos, demos, Q&A
- **Tabs:** Overview | Milestones | Repos & Demos | Questions | Invoices
- **Overview tab:** Info grid (name, client, type, status, value, dates), status dropdown, progress bar, linked proposal/lead links
- **Milestones tab:** MilestoneEditor component (phases as collapsible sections, drag/reorder, status dropdowns, add/remove, due dates, invoice triggers)
- **Repos & Demos tab:**
  - "Link Repository" form (GitHub owner/repo)
  - Linked repos list with branch activity (last 5 commits per repo, fetched from GitHub API)
  - "Add Demo Link" form (title, URL, description, phase)
  - Demos list with approve/unapprove toggle
  - Auto-pulled Vercel previews section (if webhook configured)
- **Questions tab:** QuestionReply component
- **Invoices tab:** Project-related invoices, "Create Invoice" button

### `/admin/proposals` — Proposals List
- **Purpose:** All proposals with status tracking
- **UI Sections:**
  1. **Header:** "Proposals" + count + "New Proposal" button
  2. **Table:** Title (link), Client, Amount, Status (badge), Sent date, Created date
  3. **Filters:** Status dropdown
- **Empty:** "No proposals yet."

### `/admin/proposals/new` — Create Proposal
- **Purpose:** AI-assisted proposal creation
- **UI Sections:**
  1. **Step 1 — Context:** Select lead/client, paste discovery notes, select pricing type
  2. **"Generate with AI" button** → calls Claude → populates fields
  3. **Step 2 — Edit:** Scope of work (rich text), Deliverables (rich text), Terms (rich text), Line items table (add/remove/reorder, auto-calculate total)
  4. **Step 3 — Review:** Preview as client would see it
  5. **Actions:** "Save Draft", "Send to Client" (sends email + sets status to 'sent')
- **If ?lead_id:** Pre-populate context from lead + AI analysis

### `/admin/proposals/[id]` — Proposal Detail
- **Purpose:** View, edit, track proposal
- **UI Sections:**
  1. **Header:** Title, client name, status badge, amount
  2. **Status timeline:** Draft → Sent → Viewed → Accepted/Declined
  3. **Content:** Scope, deliverables, terms (editable if draft)
  4. **Line items:** Table with totals
  5. **Actions:** "Edit" (if draft), "Send" (if draft), "Create Project from Proposal" (if accepted)
  6. **Client activity:** Viewed at, accepted at, signature

### `/admin/invoices` — Invoices List
- **Purpose:** All invoices with status and payment tracking
- **UI Sections:**
  1. **Header:** "Invoices" + count + "New Invoice" button
  2. **Table:** Title, Client, Project, Amount, Status (badge), Due Date, Paid At
  3. **Summary cards:** Total outstanding, total paid this month, overdue count
- **Empty:** "No invoices yet."

### `/admin/invoices/new` — Create Invoice
- **Purpose:** Manual invoice creation
- **UI:** Client select, project select (optional), title, description, line items table, due date, "Save Draft" / "Send via Square"

### `/admin/invoices/[id]` — Invoice Detail
- **Purpose:** View invoice status, payment info, actions
- **UI:** Invoice content, Square sync status, payment history, "Send" / "Send Reminder" / "Mark Paid" actions

### `/admin/settings` — System Settings
- **Purpose:** Team management, integration config, defaults
- **Tabs:** Team | Integrations | Notifications | Defaults
- **Team tab:** List team_users, invite form (email + role), deactivate toggle
- **Integrations tab:** GitHub (connect/disconnect), Vercel (webhook URL), Square (connect/disconnect), Twilio (credentials)
- **Notifications tab:** Toggle which events trigger email vs SMS, stale lead days threshold
- **Defaults tab:** Default proposal terms, default project phases template

### `/admin/activity` — Activity Log
- **Purpose:** Full activity history across all CRM entities
- **UI:** Filterable feed (by actor, action type, entity type, date range), paginated

---

## PORTAL PAGES (/portal/*)

### `/portal` — Portal Home
- **Purpose:** Client's project list (or auto-redirect if single project)
- **UI:** Project cards with name, status, progress bar, "View Project" button
- **Redirect:** If client has exactly 1 project → redirect to /portal/projects/[id]
- **Empty:** "No active projects found. Contact info@botmakers.ai for assistance."

### `/portal/projects/[id]` — Client Project View
- **Purpose:** Client sees project progress, milestones, demos, Q&A, timeline
- **UI Sections:**
  1. **Header:** Project name, status badge, "Phase {x} of {y}: {name}"
  2. **Progress bar:** Green fill, "X% Complete" label, animated on load
  3. **Timeline:** "What's Next" section — next 3 upcoming milestones with descriptions
  4. **Milestone checklist:** Grouped by phase, collapsible, status icons (✅ ● ○), completion dates
  5. **Demo gallery:** Approved demos only, cards with title + description + "View Demo →" button
  6. **Q&A section:** "Have a Question?" textarea + submit, previous Q&A list
- **Loading:** Skeleton progress bar + milestone list
- **Mobile:** All sections stack vertically

### `/portal/proposals/[id]` — Client Proposal View
- **Purpose:** Client reviews and accepts proposal
- **UI Sections:**
  1. **Header:** Proposal title, from Botmakers.ai, date
  2. **Content:** Scope of work, deliverables, terms — read-only
  3. **Pricing:** Line items table with totals
  4. **Acceptance section:** "Accept Proposal" button → opens modal with:
     - "I agree to the terms and conditions" checkbox
     - "Type your full name as signature" input
     - "Accept & Sign" button
  5. **Status:** If already accepted → show "Accepted on [date]" with signature
- **Mobile:** Full-width, readable at 375px

### `/portal/invoices` — Client Invoice List
- **Purpose:** Client sees all their invoices
- **UI:** Table: title, amount, status badge, due date, paid date, "Pay" button (for unpaid)
- **Empty:** "No invoices yet."

### `/portal/invoices/[id]` — Client Invoice Detail
- **Purpose:** View invoice + pay via Square
- **UI Sections:**
  1. **Invoice header:** Title, amount, status, due date
  2. **Line items:** Table
  3. **Payment:** "Pay Now" button → redirects to Square checkout URL
  4. **If paid:** "Paid on [date]" with payment confirmation
- **Mobile:** Full-width
