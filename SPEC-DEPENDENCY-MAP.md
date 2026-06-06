# SPEC-DEPENDENCY-MAP.md — Botmakers CRM v1

## Purpose
Every feature decomposed into its smallest buildable atoms. Claude Code checks this map before marking any stage complete. Staff Review verifies every atom was implemented.

## Legend
- `ATOM` — Single buildable unit
- `DEP` — Must exist before this atom works
- `EDGE` — Scenario requiring explicit handling
- `VERIFY` — How to confirm this atom works

---

## FEATURE: Team Authentication

```
FEATURE: Team Authentication
├── UI:
│   ├── ATOM: /admin/login page with centered card, dark bg
│   ├── ATOM: email input (required, email format)
│   ├── ATOM: password input (required, min 8, show/hide toggle)
│   ├── ATOM: "Sign In" button (green #03FF00)
│   ├── ATOM: loading state — button spinner, inputs disabled
│   ├── ATOM: error state — red text below button
│   ├── ATOM: success → redirect to /admin
│   └── ATOM: SEO — title "Team Login — Botmakers CRM", noindex
├── VALIDATION:
│   ├── ATOM: email format validation (client + server)
│   └── ATOM: password required (client + server)
├── SERVER:
│   ├── ATOM: signInWithPassword via Supabase Auth
│   │   ├── DEP: NEXT_PUBLIC_SUPABASE_URL
│   │   ├── DEP: NEXT_PUBLIC_SUPABASE_ANON_KEY
│   │   ├── EDGE: invalid credentials → "Invalid email or password"
│   │   ├── EDGE: user not in team_users → "Not authorized"
│   │   ├── EDGE: team_users.is_active=false → "Account disabled"
│   │   └── EDGE: rate limit exceeded → "Too many attempts"
│   ├── ATOM: getTeamUser() helper — check team_users table
│   ├── ATOM: requireTeam() helper — throw 401 if not team
│   ├── ATOM: requireAdmin() helper — throw 403 if not admin role
│   └── ATOM: logout action — clear session, redirect /admin/login
├── DATABASE:
│   ├── ATOM: team_users table with all columns
│   ├── ATOM: seed 3 admin users (Jay, Dad, Dee)
│   └── RLS: team_users readable by authenticated team only
├── MIDDLEWARE:
│   ├── ATOM: /admin/* (except /admin/login) requires team session
│   ├── ATOM: /admin/login redirects to /admin if already authed
│   └── ATOM: session refresh on every request
├── NOTIFICATIONS:
│   └── (none for login)
├── SECURITY:
│   ├── ATOM: rate limit login — 5 per 15 min per IP
│   ├── ATOM: session in httpOnly cookie
│   └── ATOM: service role key never in client code
└── LOGGING:
    └── ATOM: activity_log entry on login (action: 'team.login')
```

---

## FEATURE: Client Portal Authentication

```
FEATURE: Client Portal Auth
├── UI:
│   ├── ATOM: /portal/login page with centered card, light bg
│   ├── ATOM: email input (required, email format)
│   ├── ATOM: "Send Login Link" button
│   ├── ATOM: loading state — button spinner
│   ├── ATOM: success state — swap form for "Check your email" message
│   ├── ATOM: error state — "No account found" or rate limit message
│   └── ATOM: SEO — title "Client Portal — Botmakers.ai", noindex
├── SERVER:
│   ├── ATOM: signInWithOtp (magic link) via Supabase Auth
│   │   ├── DEP: client email exists in clients table
│   │   ├── EDGE: email not found → "No account found"
│   │   ├── EDGE: rate limit → "Too many requests"
│   │   └── ATOM: redirect URL set to SITE_URL/portal
│   ├── ATOM: getClientUser() helper — check clients by auth_user_id
│   └── ATOM: requireClient() helper — throw 401 if not client
├── MIDDLEWARE:
│   ├── ATOM: /portal/* (except /portal/login) requires client session
│   └── ATOM: /portal/login redirects to /portal if already authed
├── SECURITY:
│   ├── ATOM: rate limit magic link — 3 per hour per email
│   └── ATOM: magic link expires 1 hour (Supabase default)
└── LOGGING:
    └── ATOM: activity_log entry (action: 'client.login')
```

---

## FEATURE: CRM Dashboard

```
FEATURE: CRM Dashboard
├── UI:
│   ├── ATOM: greeting bar with name + date
│   ├── ATOM: MetricsCards component (4 cards grid)
│   │   ├── ATOM: "Leads This Week" — number + delta arrow
│   │   ├── ATOM: "Pipeline Value" — dollar amount
│   │   ├── ATOM: "Active Projects" — count
│   │   └── ATOM: "Revenue This Month" — dollar amount
│   ├── ATOM: AlertsPanel component
│   │   ├── ATOM: stale lead cards (orange)
│   │   ├── ATOM: overdue milestone cards (red)
│   │   └── ATOM: pending question cards (yellow)
│   ├── ATOM: ActivityFeed component (last 15 events)
│   ├── ATOM: QuickActions bar (Create Lead, Create Project, Create Proposal)
│   ├── ATOM: loading state — skeleton cards + skeleton feed
│   └── ATOM: empty state — welcome CTA
├── SERVER:
│   ├── ATOM: getMetrics() — leads count, pipeline value, projects, revenue
│   ├── ATOM: getAlerts() — stale leads, overdue milestones, pending questions
│   └── ATOM: getRecentActivity() — last 15 activity_log entries
│       ├── DEP: activity_log table
│       └── DEP: team auth
├── DATABASE:
│   └── DEP: leads, projects, proposals, invoices, payments, activity_log tables
└── MOBILE:
    └── ATOM: cards 1-col, activity feed below
```

---

## FEATURE: Pipeline Board (Kanban)

```
FEATURE: Pipeline Board
├── UI:
│   ├── ATOM: 10-column Kanban board
│   │   └── ATOM: each column — stage name header, lead count, colored top border
│   ├── ATOM: lead cards — name, company, source badge, score badge, days in stage
│   ├── ATOM: drag-and-drop between columns
│   ├── ATOM: click card → slide-over detail or navigate
│   ├── ATOM: filter bar — source, score, assigned_to dropdowns
│   ├── ATOM: loading state — skeleton columns
│   └── ATOM: empty column state — "No leads in this stage"
├── SERVER:
│   ├── ATOM: getLeadsByStage() — grouped by pipeline_stage
│   ├── ATOM: updateLeadStage(id, stage) — server action
│   │   ├── ATOM: validate stage is valid enum
│   │   ├── ATOM: update pipeline_stage + pipeline_stage_changed_at
│   │   ├── ATOM: if stage='contacted' → update last_contacted_at
│   │   └── ATOM: log to activity_log
│   └── ATOM: revalidatePath after stage change
├── NOTIFICATIONS:
│   └── ATOM: notify team on stage change
├── EDGE:
│   ├── EDGE: drag cancelled → revert to original position
│   ├── EDGE: concurrent move → last write wins
│   └── EDGE: network error during drag → toast error, revert
└── MOBILE:
    └── ATOM: horizontal swipe columns, simplified cards
```

---

## FEATURE: Lead Management

```
FEATURE: Lead Management
├── UI:
│   ├── ATOM: /admin/leads — filterable table
│   │   ├── ATOM: search input (debounced 300ms)
│   │   ├── ATOM: source filter dropdown
│   │   ├── ATOM: score filter dropdown
│   │   ├── ATOM: stage filter dropdown
│   │   ├── ATOM: assigned filter dropdown
│   │   ├── ATOM: table columns — name, email, source, score, stage, assigned, created
│   │   ├── ATOM: inline stage dropdown (saves on change)
│   │   ├── ATOM: pagination
│   │   ├── ATOM: loading — skeleton rows
│   │   └── ATOM: empty — "No leads yet" + CTA
│   ├── ATOM: /admin/leads/[id] — lead detail
│   │   ├── ATOM: contact info card
│   │   ├── ATOM: pipeline stage visual selector (10 steps)
│   │   ├── ATOM: AI analysis panel (collapsible)
│   │   ├── ATOM: notes textarea (auto-save on blur)
│   │   ├── ATOM: contact log timeline
│   │   ├── ATOM: "Convert to Client" button
│   │   ├── ATOM: "Create Proposal" button
│   │   ├── ATOM: "Log Contact" button + modal
│   │   └── ATOM: assigned_to dropdown
│   └── ATOM: /admin/leads/new — manual lead entry form (optional)
├── SERVER:
│   ├── ATOM: getLeads(filters, pagination, sort) — paginated query
│   ├── ATOM: getLeadById(id)
│   ├── ATOM: updateLead(id, data) — status, notes, stage, assigned_to
│   ├── ATOM: createContact(lead_id, type, subject, body, direction) — log touchpoint
│   └── ATOM: convertLeadToClient(lead_id) — see Workflow 4
├── DATABASE:
│   ├── DEP: leads table
│   ├── DEP: contacts table
│   └── ATOM: indexes on pipeline_stage, source, score, created_at
└── LOGGING:
    ├── ATOM: activity_log on stage change
    ├── ATOM: activity_log on contact logged
    └── ATOM: activity_log on conversion
```

---

## FEATURE: AI Proposal Generation

```
FEATURE: AI Proposal Generation
├── UI:
│   ├── ATOM: /admin/proposals/new — 3-step wizard
│   │   ├── ATOM: Step 1 — context (lead/client select, discovery notes textarea, pricing type)
│   │   ├── ATOM: "Generate with AI" button with loading spinner
│   │   ├── ATOM: Step 2 — edit (scope, deliverables, terms rich text, line items table)
│   │   ├── ATOM: line items — add/remove/reorder, auto-calc totals
│   │   ├── ATOM: Step 3 — preview (read-only, as client would see)
│   │   └── ATOM: "Save Draft" and "Send to Client" buttons
│   ├── ATOM: /admin/proposals/[id] — detail + edit
│   └── ATOM: /portal/proposals/[id] — client view + accept
│       ├── ATOM: read-only content display
│       ├── ATOM: "Accept & Sign" button
│       ├── ATOM: acceptance modal (checkbox + signature input)
│       ├── ATOM: accepted state display
│       ├── EDGE: expired proposal → "This proposal has expired"
│       └── EDGE: already accepted → show confirmation, no re-accept
├── SERVER:
│   ├── ATOM: generateProposal(context) — Claude API call
│   │   ├── DEP: ANTHROPIC_API_KEY
│   │   ├── ATOM: system prompt for Botmakers proposal style
│   │   ├── ATOM: parse JSON response into form fields
│   │   └── EDGE: AI fails → toast error, allow manual entry
│   ├── ATOM: createProposal(data) — insert proposal + line_items
│   ├── ATOM: updateProposal(id, data)
│   ├── ATOM: sendProposal(id) — send email + update status
│   ├── ATOM: acceptProposal(id, signature) — client action
│   │   ├── ATOM: validate proposal is 'sent' or 'viewed' status
│   │   ├── ATOM: set accepted_at, client_signature, status='accepted'
│   │   └── ATOM: notify team
│   └── ATOM: trackProposalView(id) — set viewed_at on first client visit
├── DATABASE:
│   ├── DEP: proposals table
│   └── DEP: proposal_line_items table
├── NOTIFICATIONS:
│   ├── ATOM: email to client on proposal sent
│   └── ATOM: email to team on proposal accepted
└── LOGGING:
    ├── ATOM: activity_log on created, sent, viewed, accepted, declined
    └── ATOM: audit_log on delete
```

---

## FEATURE: Project Management + GitHub/Vercel

```
FEATURE: Project Management
├── UI:
│   ├── ATOM: /admin/projects — project cards grid with progress bars
│   ├── ATOM: /admin/projects/new — creation form with phase template
│   ├── ATOM: /admin/projects/[id] — tabbed detail
│   │   ├── ATOM: Overview tab — info grid, status dropdown, progress bar
│   │   ├── ATOM: Milestones tab — MilestoneEditor
│   │   │   ├── ATOM: phases as collapsible sections
│   │   │   ├── ATOM: milestone status dropdown (pending/in_progress/completed)
│   │   │   ├── ATOM: milestone due_date picker
│   │   │   ├── ATOM: milestone invoice_trigger checkbox + amount
│   │   │   ├── ATOM: add/remove/reorder milestones
│   │   │   ├── ATOM: add/remove phases
│   │   │   └── ATOM: confirm dialog on complete: "Client will be notified"
│   │   ├── ATOM: Repos & Demos tab
│   │   │   ├── ATOM: "Link Repository" form (owner, repo)
│   │   │   ├── ATOM: linked repos list with branch/commit info
│   │   │   ├── ATOM: "Add Demo Link" form
│   │   │   ├── ATOM: demos list with approve toggle
│   │   │   └── ATOM: auto-pulled Vercel previews section
│   │   ├── ATOM: Questions tab — QuestionReply component
│   │   └── ATOM: Invoices tab — related invoices list
│   └── ATOM: /portal/projects/[id] — client view
│       ├── ATOM: progress bar (animated)
│       ├── ATOM: "What's Next" timeline
│       ├── ATOM: milestone checklist (grouped, collapsible, status icons)
│       ├── ATOM: demo gallery (approved only)
│       └── ATOM: Q&A section
├── SERVER:
│   ├── ATOM: createProject(data) — insert + default phases + milestones
│   ├── ATOM: updateProject(id, data)
│   ├── ATOM: createPhase / updatePhase / deletePhase
│   ├── ATOM: createMilestone / updateMilestone / deleteMilestone
│   │   ├── ATOM: on complete → send client email
│   │   ├── ATOM: on complete + triggers_invoice → create invoice + Square sync
│   │   └── ATOM: recalculate progress %
│   ├── ATOM: linkRepo(project_id, owner, repo)
│   │   ├── DEP: GITHUB_TOKEN
│   │   ├── ATOM: validate repo via GitHub API
│   │   └── EDGE: repo not found → error message
│   ├── ATOM: getRepoActivity(repo_id) — fetch commits from GitHub
│   ├── ATOM: createDemo / deleteDemo / toggleDemoApproval
│   ├── ATOM: submitQuestion (client) → notify team
│   ├── ATOM: replyQuestion (team) → AI polish → send client email
│   └── ATOM: polishReply(draft, context) → Claude API
├── WEBHOOKS:
│   ├── ATOM: POST /api/webhooks/github — push events
│   │   ├── ATOM: verify signature
│   │   └── ATOM: update last_synced_at
│   └── ATOM: POST /api/webhooks/vercel — deployment events
│       ├── ATOM: verify signature
│       ├── ATOM: extract preview URL
│       ├── ATOM: match to project_repos
│       └── ATOM: insert demo (is_auto_pulled=true, is_approved=false)
├── DATABASE:
│   ├── DEP: projects, project_phases, project_milestones tables
│   ├── DEP: project_repos, project_demos, project_questions tables
│   └── ATOM: default phase template constant
├── NOTIFICATIONS:
│   ├── ATOM: milestone completed email to client
│   ├── ATOM: demo shared email to client (on approve)
│   ├── ATOM: question reply email to client
│   ├── ATOM: question alert email to team
│   └── ATOM: milestone overdue alert to team (cron)
└── LOGGING:
    ├── ATOM: activity_log on all project/milestone/demo/question actions
    └── ATOM: audit_log on delete actions
```

---

## FEATURE: Square Billing

```
FEATURE: Square Billing
├── UI:
│   ├── ATOM: /admin/invoices — list with status badges + summary cards
│   ├── ATOM: /admin/invoices/new — form with line items + Square send
│   ├── ATOM: /admin/invoices/[id] — detail with payment history
│   ├── ATOM: /portal/invoices — client invoice list
│   └── ATOM: /portal/invoices/[id] — client view + "Pay Now" button
├── SERVER:
│   ├── ATOM: createInvoice(data) — insert invoice + line_items
│   ├── ATOM: sendViaSquare(id) — create Square invoice, send to client
│   │   ├── DEP: SQUARE_ACCESS_TOKEN
│   │   ├── DEP: SQUARE_LOCATION_ID
│   │   ├── EDGE: Square API fails → save draft, show warning
│   │   └── ATOM: store square_invoice_id + square_payment_url
│   ├── ATOM: generateCheckoutLink(id) — Square Checkout API
│   ├── ATOM: markPaid(id) — manual payment recording
│   └── ATOM: handleSquareWebhook — payment.completed processing
│       ├── ATOM: verify HMAC signature
│       ├── ATOM: find invoice by square_invoice_id
│       ├── ATOM: update invoice status to 'paid'
│       ├── ATOM: insert payment record
│       ├── EDGE: invoice not found → log warning
│       └── EDGE: duplicate webhook → skip if already paid
├── DATABASE:
│   ├── DEP: invoices, invoice_line_items, payments tables
│   └── ATOM: indexes on square_invoice_id, client_id
├── NOTIFICATIONS:
│   ├── ATOM: invoice sent email to client (via Square)
│   ├── ATOM: payment received notification to team
│   └── ATOM: payment confirmation to client
└── LOGGING:
    ├── ATOM: activity_log on invoice created, sent, paid
    └── ATOM: audit_log on cancel/delete
```

---

## FEATURE: Notification System

```
FEATURE: Notification System
├── SERVER:
│   ├── ATOM: sendNotification(type, channel, recipient, data) — central dispatcher
│   ├── ATOM: email via Resend
│   │   ├── DEP: RESEND_API_KEY
│   │   ├── ATOM: branded HTML email templates
│   │   └── EDGE: Resend fails → log error, don't crash caller
│   ├── ATOM: SMS via Twilio (graceful fallback if not configured)
│   │   ├── DEP: TWILIO_ACCOUNT_SID (optional)
│   │   ├── DEP: TWILIO_AUTH_TOKEN (optional)
│   │   ├── DEP: TWILIO_PHONE_NUMBER (optional)
│   │   └── EDGE: Twilio not configured → skip SMS silently
│   └── ATOM: log all notifications to notifications table
├── TRIGGERS (7):
│   ├── ATOM: new lead → email to team
│   ├── ATOM: lead stage change → email to team
│   ├── ATOM: proposal accepted → email to team
│   ├── ATOM: payment received → email to team + receipt to client
│   ├── ATOM: client question → email to team
│   ├── ATOM: milestone overdue → email to team (cron)
│   └── ATOM: stale lead → email to assigned team member (cron)
└── DATABASE:
    └── DEP: notifications table for logging
```

---

## CROSS-CUTTING ATOMS

```
CROSS-CUTTING:
├── ENV VALIDATION:
│   ├── ATOM: src/lib/env.ts validates ALL env vars at startup
│   ├── ATOM: app refuses to start if required vars missing
│   └── ATOM: typed env export (no raw process.env elsewhere)
├── ERROR HANDLING:
│   ├── ATOM: every server action in try/catch
│   ├── ATOM: friendly error messages (no stack traces)
│   ├── ATOM: custom 404 page
│   ├── ATOM: custom 500 page
│   ├── ATOM: toast notifications for success/error on mutations
│   └── ATOM: error boundaries on route segments
├── LOADING STATES:
│   ├── ATOM: every page has loading.tsx or skeleton
│   ├── ATOM: every async button has spinner
│   ├── ATOM: every list has skeleton rows
│   └── ATOM: every form disabled during submit
├── EMPTY STATES:
│   ├── ATOM: every list/table has empty state with CTA
│   └── ATOM: no technical jargon
├── RATE LIMITING:
│   ├── ATOM: public forms rate limited (Upstash)
│   ├── ATOM: login rate limited
│   └── ATOM: friendly rate limit message
├── SECURITY:
│   ├── ATOM: XSS prevention
│   ├── ATOM: SQL injection safe (Drizzle parameterized)
│   ├── ATOM: RLS on all tables
│   ├── ATOM: no secrets in client code
│   └── ATOM: security headers
├── MOBILE:
│   ├── ATOM: all pages responsive 375px+
│   ├── ATOM: touch targets min 44px
│   └── ATOM: navigation works on mobile
├── ACCESSIBILITY:
│   ├── ATOM: form fields have labels
│   ├── ATOM: color contrast > 4.5:1
│   ├── ATOM: keyboard navigation
│   └── ATOM: alt text on images
└── PERFORMANCE:
    ├── ATOM: images lazy loaded
    ├── ATOM: server components by default
    ├── ATOM: large lists paginated
    └── ATOM: Lighthouse > 85
```
