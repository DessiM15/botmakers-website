# SPEC-AUTH.md — Botmakers CRM v1

---

## Role Definitions

### Admin (team_role = 'admin')
Jay, Dad (Trent), Dee. Full access to every CRM feature. Can manage team members, integrations, system settings. Can perform destructive actions (delete, cancel). All actions logged to audit_log.

### Team Member (team_role = 'member')
Future team members added by admins. Same CRM access as admin EXCEPT: cannot manage team_users, cannot change system_settings, cannot delete records (only archive). For v1, all three users are admin. Member role is schema-ready but not built in UI.

### Client
External clients who access the portal. Authenticated via magic link (Supabase Auth OTP). Can only see their own data. Cannot access /admin/* routes. Can: view projects, accept proposals, pay invoices, submit questions, view approved demos.

### Visitor (unauthenticated)
Public website visitor. Can: view marketing pages, submit lead form, submit referral form. Cannot access /admin/* or /portal/*.

---

## Permission Matrix

| Resource | Admin | Member | Client | Visitor |
|----------|-------|--------|--------|---------|
| **Leads** | | | | |
| View all leads | ✅ | ✅ | ❌ | ❌ |
| Create lead (form) | ❌ | ❌ | ❌ | ✅ |
| Update lead (status, notes, stage) | ✅ | ✅ | ❌ | ❌ |
| Delete lead | ✅ | ❌ | ❌ | ❌ |
| Convert lead to client | ✅ | ✅ | ❌ | ❌ |
| **Referrals** | | | | |
| View all referrals | ✅ | ✅ | ❌ | ❌ |
| Submit referral | ❌ | ❌ | ❌ | ✅ |
| **Clients** | | | | |
| View all clients | ✅ | ✅ | ❌ | ❌ |
| View own profile | ❌ | ❌ | ✅ | ❌ |
| Create client | ✅ | ✅ | ❌ | ❌ |
| Update client | ✅ | ✅ | ❌ | ❌ |
| Delete client | ✅ | ❌ | ❌ | ❌ |
| **Projects** | | | | |
| View all projects | ✅ | ✅ | ❌ | ❌ |
| View own projects | ❌ | ❌ | ✅ | ❌ |
| Create project | ✅ | ✅ | ❌ | ❌ |
| Update project | ✅ | ✅ | ❌ | ❌ |
| Manage milestones | ✅ | ✅ | ❌ | ❌ |
| Manage repos | ✅ | ✅ | ❌ | ❌ |
| Manage demos | ✅ | ✅ | ❌ | ❌ |
| Approve demos for portal | ✅ | ✅ | ❌ | ❌ |
| **Proposals** | | | | |
| View all proposals | ✅ | ✅ | ❌ | ❌ |
| View own proposals | ❌ | ❌ | ✅ | ❌ |
| Create proposal | ✅ | ✅ | ❌ | ❌ |
| Generate AI proposal | ✅ | ✅ | ❌ | ❌ |
| Send proposal | ✅ | ✅ | ❌ | ❌ |
| Accept proposal | ❌ | ❌ | ✅ | ❌ |
| **Invoices** | | | | |
| View all invoices | ✅ | ✅ | ❌ | ❌ |
| View own invoices | ❌ | ❌ | ✅ | ❌ |
| Create invoice | ✅ | ✅ | ❌ | ❌ |
| Send invoice | ✅ | ✅ | ❌ | ❌ |
| Pay invoice | ❌ | ❌ | ✅ | ❌ |
| **Questions** | | | | |
| View all questions | ✅ | ✅ | ❌ | ❌ |
| View own questions | ❌ | ❌ | ✅ | ❌ |
| Submit question | ❌ | ❌ | ✅ | ❌ |
| Reply to question | ✅ | ✅ | ❌ | ❌ |
| AI polish reply | ✅ | ✅ | ❌ | ❌ |
| **Settings** | | | | |
| Manage team users | ✅ | ❌ | ❌ | ❌ |
| Manage integrations | ✅ | ❌ | ❌ | ❌ |
| Manage system settings | ✅ | ❌ | ❌ | ❌ |
| **Activity/Audit** | | | | |
| View activity log | ✅ | ✅ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ❌ |

---

## Route Protection

| Route Pattern | Required Auth | Required Role | Redirect If Unauthorized |
|---------------|--------------|---------------|-------------------------|
| `/` | None | None | — |
| `/about` | None | None | — |
| `/refer` | None | None | — |
| `/admin/login` | None (redirect if already authed) | None | → /admin if already team |
| `/admin/*` | Supabase session | team_users record | → /admin/login |
| `/portal/login` | None (redirect if already authed) | None | → /portal if already client |
| `/portal/*` | Supabase session | clients record | → /portal/login |
| `/api/leads` | None | None | 401 JSON |
| `/api/referrals` | None | None | 401 JSON |
| `/api/webhooks/*` | Webhook secret verification | None | 401 JSON |
| `/api/cron/*` | CRON_SECRET header | None | 401 JSON |

---

## Middleware Logic

```
middleware.ts:
1. Get Supabase session from cookies
2. If path starts with /admin (except /admin/login):
   a. No session → redirect /admin/login
   b. Session exists → check team_users table for user
   c. Not in team_users → redirect /admin/login
   d. In team_users but is_active=false → redirect /admin/login
3. If path starts with /portal (except /portal/login):
   a. No session → redirect /portal/login
   b. Session exists → check clients table for auth_user_id
   c. Not a client → redirect /portal/login
4. If path is /admin/login and user is already authenticated team → redirect /admin
5. If path is /portal/login and user is already authenticated client → redirect /portal
6. Refresh session token on every request
```

---

## RLS Policies (per table)

### team_users
- SELECT: `auth.uid() IN (SELECT id FROM team_users WHERE is_active = true)`
- INSERT/UPDATE/DELETE: `auth.uid() IN (SELECT id FROM team_users WHERE role = 'admin')`

### clients
- Team SELECT: `auth.uid() IN (SELECT id FROM team_users)`
- Client SELECT: `auth.uid() = auth_user_id`
- INSERT/UPDATE/DELETE: `auth.uid() IN (SELECT id FROM team_users)`

### leads
- ALL: `auth.uid() IN (SELECT id FROM team_users)`

### referrers
- ALL: `auth.uid() IN (SELECT id FROM team_users)`

### contacts
- ALL: `auth.uid() IN (SELECT id FROM team_users)`

### proposals
- Team ALL: `auth.uid() IN (SELECT id FROM team_users)`
- Client SELECT: `client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid()) AND status != 'draft'`

### proposal_line_items
- Follows parent proposal RLS

### projects
- Team ALL: `auth.uid() IN (SELECT id FROM team_users)`
- Client SELECT: `client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())`

### project_phases, project_milestones
- Follows parent project RLS

### project_repos
- ALL: `auth.uid() IN (SELECT id FROM team_users)` (team only)

### project_demos
- Team ALL: `auth.uid() IN (SELECT id FROM team_users)`
- Client SELECT: `is_approved = true AND project_id IN (SELECT id FROM projects WHERE client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid()))`

### project_questions
- Team ALL: `auth.uid() IN (SELECT id FROM team_users)`
- Client SELECT: `client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())`
- Client INSERT: `client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())`

### invoices, invoice_line_items, payments
- Team ALL: `auth.uid() IN (SELECT id FROM team_users)`
- Client SELECT: `client_id IN (SELECT id FROM clients WHERE auth_user_id = auth.uid())`

### notifications, activity_log
- ALL: `auth.uid() IN (SELECT id FROM team_users)`

### audit_log
- SELECT: `auth.uid() IN (SELECT id FROM team_users WHERE role = 'admin')`

### system_settings
- SELECT: `auth.uid() IN (SELECT id FROM team_users)`
- UPDATE: `auth.uid() IN (SELECT id FROM team_users WHERE role = 'admin')`

---

## Security Hardening Checklist

- [ ] Service role key only in server-side code (never NEXT_PUBLIC_)
- [ ] Rate limiting on /api/leads, /api/referrals (existing Upstash)
- [ ] Rate limiting on /admin/login (5 attempts per 15 min per IP)
- [ ] Rate limiting on /portal/auth/magic-link (3 per hour per email)
- [ ] Webhook endpoints verify signatures (Square, GitHub, Vercel)
- [ ] Cron endpoints require CRON_SECRET header
- [ ] All user input sanitized server-side before DB insert
- [ ] No raw SQL — all queries via Drizzle ORM
- [ ] Auth tokens in HTTP-only cookies via @supabase/ssr
- [ ] HTTPS enforced by Vercel
- [ ] Security headers in next.config (X-Frame-Options, CSP, HSTS)
- [ ] File uploads validated server-side (MIME + size) if added later
- [ ] Magic links expire after 1 hour (Supabase default)
- [ ] Session refresh on every request (middleware)
