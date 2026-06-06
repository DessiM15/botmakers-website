# CLAUDE.md — Botmakers CRM v1

## Project Overview
Botmakers CRM is an internal customer relationship management system for BotMakers Inc. (botmakers.ai), an AI-accelerated software development company in Katy, Texas. It manages the full client lifecycle: lead capture → pipeline management → AI-generated proposals → project delivery (with GitHub/Vercel integration) → billing (Square) → client portal → post-delivery retention. Built as a fresh Next.js 15 application deployed to Vercel at botmakers.ai.

## Tech Stack
- **Framework:** Next.js 15 (App Router, Server Components, Server Actions)
- **Language:** TypeScript strict mode (no `any`)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **ORM:** Drizzle ORM
- **Auth:** Supabase Auth (email/password for team, magic link for clients)
- **UI:** shadcn/ui + Radix + Tailwind CSS
- **Email:** Resend
- **SMS:** Twilio (optional — graceful fallback)
- **AI:** Anthropic Claude API (@anthropic-ai/sdk) — model: claude-sonnet-4-5-20250929
- **Payments:** Square (Node SDK) — invoices + checkout links
- **VCS:** GitHub API (@octokit/rest) — repo activity
- **Rate Limiting:** Upstash Redis (@upstash/ratelimit)
- **Deployment:** Vercel
- **Testing:** Vitest + Playwright

## File Structure
```
src/
  app/
    (public)/              # Homepage, about, refer
    (auth)/                # /admin/login, /portal/login
    admin/                 # CRM team pages
      layout.tsx
      page.tsx             # Dashboard
      pipeline/page.tsx    # Kanban board
      leads/
      clients/
      projects/
      proposals/
      invoices/
      settings/page.tsx
      activity/page.tsx
    portal/                # Client portal pages
      layout.tsx
      page.tsx
      projects/[id]/
      proposals/[id]/
      invoices/
    api/
      leads/               # Public lead form
      referrals/           # Public referral form
      admin/               # Team CRM endpoints
      portal/              # Client portal endpoints
      ai/                  # Claude API endpoints
      webhooks/            # Square, GitHub, Vercel
      cron/                # Stale leads, overdue milestones
  components/
    ui/                    # shadcn/ui components
    admin/                 # CRM-specific components
    portal/                # Portal-specific components
    shared/                # Shared (email templates, logos)
  lib/
    db/
      schema.ts            # Drizzle schema (all tables)
      client.ts            # Supabase + Drizzle clients
      queries/             # Query functions by domain
    auth/
      helpers.ts           # getTeamUser, getClientUser, requireTeam, requireAdmin, requireClient
      middleware.ts         # Route protection logic
    actions/               # Server actions by domain
    email/
      client.ts            # Resend client
      templates/           # HTML email template functions
    integrations/
      square.ts            # Square API client + helpers
      github.ts            # GitHub API client + helpers
      twilio.ts            # Twilio client (optional)
    ai/
      client.ts            # Anthropic client
      prompts.ts           # System prompts for proposals, polish, analysis
    utils/                 # Formatters, validators, constants
    types/                 # Shared types + Zod schemas
    env.ts                 # Env validation
  hooks/                   # Custom React hooks
```

## Coding Rules

### General
- Every file under 300 lines. Split if larger.
- Every function under 50 lines. Extract helpers.
- No `any` type. Use `unknown` and narrow, or proper types.
- All data types in src/lib/types/ with Zod schemas.
- All DB queries in src/lib/db/queries/ — components never import Drizzle directly.
- Use Server Actions for mutations. API routes only for public endpoints, webhooks, and cron.
- Use Server Components by default. 'use client' only for interactivity.

### Database
- All tables: id (uuid), created_at, updated_at.
- Never hard delete. Soft delete via status or is_active flag.
- All mutations in DB transactions where multiple tables affected.
- RLS enforced on all tables.
- Use Drizzle ORM for all queries (no raw SQL).

### UI
- Every page: skeleton loading state (loading.tsx).
- Every list: empty state with helpful CTA.
- Every form: Zod validation, inline errors, loading button, disabled during submit.
- Every mutation: success/error toast via shadcn/ui toast.
- Mobile responsive: all pages 375px+.
- Admin theme: dark (navy #033457 bg, green #03FF00 accents).
- Portal theme: light (white/gray bg, navy text, green CTAs).

### Security
- Rate limit all public endpoints (Upstash).
- Sanitize user input (XSS prevention).
- Audit log for all admin destructive actions.
- Webhook endpoints verify signatures before processing.
- Cron endpoints require CRON_SECRET header.

### Error Codes
- CB-AUTH-001: Invalid credentials
- CB-AUTH-002: Session expired
- CB-AUTH-003: Not authorized (not team member)
- CB-AUTH-004: Not authorized (not admin role)
- CB-AUTH-010: Magic link send failed
- CB-AUTH-011: Client email not found
- CB-DB-001: Insert failed
- CB-DB-002: Record not found
- CB-DB-003: Foreign key violation
- CB-API-001: Missing required field
- CB-API-002: Invalid field value
- CB-API-003: Rate limit exceeded
- CB-INT-001: Resend email failed
- CB-INT-002: Claude API failed
- CB-INT-003: Square API failed
- CB-INT-004: GitHub API failed
- CB-INT-005: Twilio SMS failed (non-fatal)

### Spec Traceability
Every component references its spec:
```typescript
// SPEC: SPEC-PAGES > /admin/leads
// SPEC: SPEC-WORKFLOWS > Workflow 3: Pipeline Stage Change
// DEP-MAP: Lead Management > SERVER > updateLead
```

## Environment Variables
See .env.example. App refuses to start if required vars missing (validated by src/lib/env.ts).

## Branding
- Primary: #033457 (Navy)
- Secondary: #03FF00 (Green)
- Accent: #1E40AF (Blue)
- Font: Inter Tight
- Admin dark theme, Portal light theme
