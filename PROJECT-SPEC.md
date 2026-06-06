# PROJECT-SPEC.md — Botmakers CRM v1

## Gate 0: Project Overview

### Identity
- **App Name:** Botmakers CRM
- **Domain:** botmakers.ai
- **Owner:** BotMakers Inc. — Katy, Texas
- **Built by:** BotMakers Inc. (internal tool)

### Problem
BotMakers has no centralized system to manage the full client lifecycle — from first contact through project delivery and post-launch retention. Leads arrive from 5 channels (website form, referrals, Vapi AI calls, cold outreach, word of mouth) with no unified dashboard. Project progress isn't connected to actual dev activity in GitHub/Vercel. Proposals are drafted ad-hoc with AI. Payments aren't tracked alongside project status. Post-delivery follow-up falls through the cracks, losing repeat business.

### Solution
1. CRM pipeline with 10 stages from New Lead → Retention/Upsell
2. AI-powered proposal generation with client portal acceptance
3. Project management with GitHub repo attachment and Vercel preview URL auto-pull
4. Client portal for progress tracking, proposal acceptance, invoice payment, and Q&A
5. Square integration for invoicing and payment links tied to milestones
6. Automated notifications across email and SMS for 7 trigger events
7. Stale lead detection and milestone overdue alerts

### Roles
- **Admin:** Jay, Dad (Trent), Dee — full CRM access. Manage leads, projects, proposals, billing, team settings. Access via "Team Login" link in website footer.
- **Team Member (future):** Added by admins. Configurable permissions per module.
- **Client:** Portal access via existing "Client Portal" link on website. Magic link auth. View own projects, accept proposals, pay invoices, submit questions, see approved demo links.
- **Visitor (unauthenticated):** Public website, lead form, referral form.

### Entities
team_users, clients, leads, referrers, pipeline_stages, contacts, proposals, proposal_line_items, projects, project_phases, project_milestones, project_repos, project_demos, project_questions, invoices, invoice_line_items, payments, notifications, activity_log, audit_log, system_settings

### Integrations
- **GitHub:** Attach repos to projects, view branch activity, pull commit history
- **Vercel:** Auto-pull preview/deployment URLs as demo links
- **Resend:** All email notifications (milestone, demo, proposal, invoice, welcome, question alert, stale lead)
- **Twilio:** SMS notifications (waiting on credentials — graceful fallback if not configured)
- **Claude AI (Anthropic):** Lead analysis, proposal drafting from discovery notes, reply polishing
- **Square:** Invoices (auto-generated on milestone completion), checkout links (manual for deposits/quick payments), payment webhook tracking

### Tech Stack
- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **ORM:** Drizzle ORM
- **Auth:** Supabase Auth (email/password for team, magic link for clients)
- **UI:** shadcn/ui + Tailwind CSS
- **Email:** Resend
- **Deployment:** Vercel
- **Testing:** Vitest + Playwright
- **Additional:** @anthropic-ai/sdk, square (Node SDK), @octokit/rest, @upstash/ratelimit

### Branding
- **Primary Color:** #033457 (Navy)
- **Secondary Color:** #03FF00 (Green)
- **Accent Color:** #1E40AF (Blue — for links/info states)
- **Font:** Inter Tight
- **Logo:** /public/botmakers-white-green-logo.png (dark bg), /public/botmakers-full-logo.png (light bg)

### URL Structure

**Public:**
- `/` — Marketing homepage (existing)
- `/about` — About page (existing)
- `/refer` — Referral form (existing)
- `/portal/login` — Client portal login (magic link)
- `/portal` — Client portal home (project list or redirect)
- `/portal/projects/[id]` — Client project view (progress, milestones, demos, Q&A)
- `/portal/proposals/[id]` — Client proposal view + accept
- `/portal/invoices` — Client invoice list + pay
- `/portal/invoices/[id]` — Client invoice detail + pay

**Team CRM (protected):**
- `/admin/login` — Team login
- `/admin` — CRM dashboard (metrics, activity, alerts)
- `/admin/pipeline` — Pipeline board (Kanban of 10 stages)
- `/admin/leads` — Leads list (table view)
- `/admin/leads/[id]` — Lead detail (AI analysis, notes, pipeline stage, convert)
- `/admin/referrals` — Referrals list (grouped by referrer)
- `/admin/clients` — Clients list
- `/admin/clients/[id]` — Client detail (projects, invoices, history)
- `/admin/projects` — Projects list
- `/admin/projects/new` — Create project
- `/admin/projects/[id]` — Project detail (tabbed: overview, milestones, repos, demos, Q&A)
- `/admin/proposals` — Proposals list
- `/admin/proposals/new` — Create/generate proposal
- `/admin/proposals/[id]` — Proposal detail + edit + send
- `/admin/invoices` — Invoices list
- `/admin/invoices/new` — Create invoice
- `/admin/invoices/[id]` — Invoice detail
- `/admin/settings` — System settings (team, integrations, notifications)
- `/admin/activity` — Activity log

**API:**
- `/api/leads` — Public lead form submission (existing)
- `/api/referrals` — Public referral submission (existing)
- `/api/webhooks/square` — Square payment webhooks
- `/api/webhooks/github` — GitHub webhook (push events)
- `/api/webhooks/vercel` — Vercel deployment webhooks
- `/api/cron/stale-leads` — Daily check for stale leads
- `/api/cron/overdue-milestones` — Daily check for overdue milestones

### Build Stage Mapping
- Stage 1: Schema, types, env validation
- Stage 2: Auth, middleware, RLS
- Stage 3: Public pages (marketing site + lead/referral forms)
- Stage 4: Core features (pipeline, leads, clients, projects, GitHub/Vercel, AI)
- Stage 5: Client portal (project view, proposals, invoices, Q&A)
- Stage 6: Admin CRM (dashboard, pipeline board, proposals, invoices, settings)
- Stage 7: Polish + dependency map verification
