# SPEC-DATA-MODEL.md — Botmakers CRM v1

---

## Enums

```sql
CREATE TYPE lead_source AS ENUM ('web_form', 'referral', 'vapi', 'cold_outreach', 'word_of_mouth', 'other');
CREATE TYPE lead_score AS ENUM ('high', 'medium', 'low');
CREATE TYPE pipeline_stage AS ENUM ('new_lead', 'contacted', 'discovery_scheduled', 'discovery_completed', 'proposal_sent', 'negotiation', 'contract_signed', 'active_client', 'project_delivered', 'retention');
CREATE TYPE project_status AS ENUM ('draft', 'in_progress', 'paused', 'completed', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE pricing_type AS ENUM ('fixed', 'phased', 'hourly');
CREATE TYPE payment_method AS ENUM ('square_invoice', 'square_checkout', 'manual', 'other');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app');
CREATE TYPE notification_type AS ENUM ('lead_new', 'lead_stage_change', 'proposal_accepted', 'payment_received', 'client_question', 'milestone_overdue', 'lead_stale', 'demo_shared', 'milestone_completed');
CREATE TYPE team_role AS ENUM ('admin', 'member');
CREATE TYPE question_status AS ENUM ('pending', 'replied');
```

---

## Table: team_users

Team members who access the CRM.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | Matches Supabase Auth user ID |
| email | TEXT | No | — | Unique |
| full_name | TEXT | No | — | Display name |
| role | team_role | No | 'member' | admin or member |
| avatar_url | TEXT | Yes | NULL | Profile photo |
| is_active | BOOLEAN | No | true | Soft disable |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** UNIQUE(email)
**RLS:** Only team_users can read. Only admins can write.

---

## Table: clients

Client records (linked to portal auth accounts).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| email | TEXT | No | — | Unique. Used for portal auth. |
| full_name | TEXT | No | — | |
| company | TEXT | Yes | NULL | |
| phone | TEXT | Yes | NULL | E.164 format |
| notes | TEXT | Yes | NULL | Internal notes |
| auth_user_id | UUID | Yes | NULL | FK to Supabase Auth. Set when portal account created. |
| created_by | UUID | Yes | NULL | FK to team_users.id |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** UNIQUE(email), INDEX(auth_user_id)
**RLS:** Team sees all. Client sees own record (auth_user_id = auth.uid()).

---

## Table: leads

Every inbound lead from any source.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| full_name | TEXT | No | — | |
| email | TEXT | No | — | |
| phone | TEXT | Yes | NULL | E.164 |
| company_name | TEXT | Yes | NULL | |
| project_type | TEXT | Yes | NULL | From form dropdown |
| project_timeline | TEXT | Yes | NULL | From form dropdown |
| existing_systems | TEXT | Yes | NULL | |
| referral_source | TEXT | Yes | NULL | |
| preferred_contact | TEXT | No | 'email' | |
| project_details | TEXT | Yes | NULL | Min 50 chars on form |
| sms_consent | BOOLEAN | No | false | |
| sms_consent_timestamp | TIMESTAMPTZ | Yes | NULL | |
| sms_consent_ip | TEXT | Yes | NULL | |
| sms_opted_out | BOOLEAN | No | false | |
| source | lead_source | No | 'web_form' | |
| score | lead_score | Yes | NULL | Set by AI analysis |
| pipeline_stage | pipeline_stage | No | 'new_lead' | Current stage |
| pipeline_stage_changed_at | TIMESTAMPTZ | No | now() | When stage last changed |
| ai_internal_analysis | JSONB | Yes | NULL | Full AI analysis object |
| ai_prospect_summary | TEXT | Yes | NULL | Prospect-facing summary |
| referred_by | UUID | Yes | NULL | FK to referrers.id |
| referral_email_sent | BOOLEAN | No | false | |
| referral_email_sent_at | TIMESTAMPTZ | Yes | NULL | |
| converted_to_client_id | UUID | Yes | NULL | FK to clients.id (set on conversion) |
| assigned_to | UUID | Yes | NULL | FK to team_users.id |
| notes | TEXT | Yes | NULL | Internal team notes |
| last_contacted_at | TIMESTAMPTZ | Yes | NULL | For stale lead detection |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(pipeline_stage), INDEX(source), INDEX(score), INDEX(created_at), INDEX(assigned_to), INDEX(last_contacted_at), INDEX(converted_to_client_id)
**RLS:** Team only.

---

## Table: referrers

People who refer others to Botmakers.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| slug | TEXT | No | — | Unique, URL-safe for ?from= param |
| full_name | TEXT | No | — | |
| email | TEXT | No | — | |
| company | TEXT | Yes | NULL | |
| feedback | TEXT | Yes | NULL | |
| ai_feedback_analysis | JSONB | Yes | NULL | |
| total_referrals | INTEGER | No | 0 | |
| from_param | TEXT | Yes | NULL | |
| ip_address | TEXT | Yes | NULL | |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** UNIQUE(slug), UNIQUE(email)
**RLS:** Team only.

---

## Table: contacts

General contact log — every touchpoint with a lead/client.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| lead_id | UUID | Yes | NULL | FK to leads.id |
| client_id | UUID | Yes | NULL | FK to clients.id |
| type | TEXT | No | — | 'email', 'phone', 'sms', 'meeting', 'note' |
| subject | TEXT | Yes | NULL | |
| body | TEXT | Yes | NULL | |
| direction | TEXT | No | 'outbound' | 'inbound' or 'outbound' |
| created_by | UUID | Yes | NULL | FK to team_users.id |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(lead_id), INDEX(client_id), INDEX(created_at)
**RLS:** Team only.

---

## Table: proposals

AI-generated or manually created proposals.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| lead_id | UUID | Yes | NULL | FK to leads.id |
| client_id | UUID | Yes | NULL | FK to clients.id |
| project_id | UUID | Yes | NULL | FK to projects.id (linked after acceptance) |
| title | TEXT | No | — | Proposal title |
| scope_of_work | TEXT | No | — | Rich text / markdown |
| deliverables | TEXT | No | — | Rich text / markdown |
| terms_and_conditions | TEXT | No | — | Rich text / markdown |
| pricing_type | pricing_type | No | 'fixed' | |
| total_amount | DECIMAL(10,2) | No | 0 | |
| status | proposal_status | No | 'draft' | |
| sent_at | TIMESTAMPTZ | Yes | NULL | |
| viewed_at | TIMESTAMPTZ | Yes | NULL | |
| accepted_at | TIMESTAMPTZ | Yes | NULL | |
| declined_at | TIMESTAMPTZ | Yes | NULL | |
| expires_at | TIMESTAMPTZ | Yes | NULL | |
| client_signature | TEXT | Yes | NULL | Name typed as signature |
| ai_generated | BOOLEAN | No | false | Was this AI-drafted? |
| ai_prompt_context | TEXT | Yes | NULL | Discovery notes used for AI draft |
| created_by | UUID | No | — | FK to team_users.id |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(lead_id), INDEX(client_id), INDEX(project_id), INDEX(status), INDEX(created_at)
**RLS:** Team sees all. Client sees own (client_id → clients.auth_user_id = auth.uid()).

---

## Table: proposal_line_items

Individual pricing items within a proposal.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| proposal_id | UUID | No | — | FK to proposals.id ON DELETE CASCADE |
| description | TEXT | No | — | |
| quantity | DECIMAL(10,2) | No | 1 | |
| unit_price | DECIMAL(10,2) | No | 0 | |
| total | DECIMAL(10,2) | No | 0 | Computed: quantity * unit_price |
| sort_order | INTEGER | No | 0 | |
| phase_label | TEXT | Yes | NULL | e.g., "Phase 1: Discovery" for phased pricing |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(proposal_id)
**RLS:** Follows proposal RLS.

---

## Table: projects

Active client projects.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| name | TEXT | No | — | |
| client_id | UUID | No | — | FK to clients.id |
| proposal_id | UUID | Yes | NULL | FK to proposals.id |
| lead_id | UUID | Yes | NULL | FK to leads.id (original lead) |
| project_type | TEXT | Yes | NULL | |
| description | TEXT | Yes | NULL | Internal notes |
| status | project_status | No | 'draft' | |
| pricing_type | pricing_type | No | 'fixed' | |
| total_value | DECIMAL(10,2) | No | 0 | Contract value |
| start_date | DATE | Yes | NULL | |
| target_end_date | DATE | Yes | NULL | |
| actual_end_date | DATE | Yes | NULL | |
| created_by | UUID | No | — | FK to team_users.id |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(client_id), INDEX(status), INDEX(created_at)
**RLS:** Team sees all. Client sees own (client_id → clients.auth_user_id = auth.uid()).

---

## Table: project_phases

Phases within a project (e.g., Discovery, MVP, Revision, Launch).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| project_id | UUID | No | — | FK to projects.id ON DELETE CASCADE |
| name | TEXT | No | — | |
| sort_order | INTEGER | No | 0 | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(project_id, sort_order)
**RLS:** Follows project RLS.

---

## Table: project_milestones

Individual milestones within phases.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| project_id | UUID | No | — | FK to projects.id ON DELETE CASCADE |
| phase_id | UUID | No | — | FK to project_phases.id ON DELETE CASCADE |
| title | TEXT | No | — | |
| description | TEXT | Yes | NULL | |
| status | milestone_status | No | 'pending' | |
| sort_order | INTEGER | No | 0 | |
| due_date | DATE | Yes | NULL | For overdue detection |
| completed_at | TIMESTAMPTZ | Yes | NULL | |
| triggers_invoice | BOOLEAN | No | false | Auto-create Square invoice on completion |
| invoice_amount | DECIMAL(10,2) | Yes | NULL | Amount to invoice if triggers_invoice |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(project_id), INDEX(phase_id), INDEX(status), INDEX(due_date)
**RLS:** Follows project RLS.

---

## Table: project_repos

GitHub repositories linked to projects.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| project_id | UUID | No | — | FK to projects.id ON DELETE CASCADE |
| github_owner | TEXT | No | — | GitHub org or username |
| github_repo | TEXT | No | — | Repository name |
| github_url | TEXT | No | — | Full URL |
| default_branch | TEXT | No | 'main' | |
| last_synced_at | TIMESTAMPTZ | Yes | NULL | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(project_id), UNIQUE(project_id, github_owner, github_repo)
**RLS:** Team only.

---

## Table: project_demos

Demo/preview links shared with clients.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| project_id | UUID | No | — | FK to projects.id ON DELETE CASCADE |
| title | TEXT | No | — | |
| url | TEXT | No | — | Vercel preview, Loom, etc. |
| description | TEXT | Yes | NULL | |
| phase_id | UUID | Yes | NULL | FK to project_phases.id |
| is_auto_pulled | BOOLEAN | No | false | True if auto-pulled from Vercel |
| is_approved | BOOLEAN | No | false | Must be true for client to see |
| created_by | UUID | Yes | NULL | FK to team_users.id (null if auto-pulled) |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(project_id), INDEX(is_approved)
**RLS:** Team sees all. Client sees approved only where project is theirs.

---

## Table: project_questions

Client Q&A on projects.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| project_id | UUID | No | — | FK to projects.id ON DELETE CASCADE |
| client_id | UUID | No | — | FK to clients.id |
| question_text | TEXT | No | — | Min 10 chars |
| status | question_status | No | 'pending' | |
| reply_draft | TEXT | Yes | NULL | Team's raw draft |
| reply_text | TEXT | Yes | NULL | Final reply (post AI-polish) |
| replied_by | UUID | Yes | NULL | FK to team_users.id |
| replied_at | TIMESTAMPTZ | Yes | NULL | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(project_id), INDEX(client_id), INDEX(status)
**RLS:** Team sees all. Client sees own project's questions.

---

## Table: invoices

Square-synced invoices.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| client_id | UUID | No | — | FK to clients.id |
| project_id | UUID | Yes | NULL | FK to projects.id |
| milestone_id | UUID | Yes | NULL | FK to project_milestones.id (if auto-generated) |
| square_invoice_id | TEXT | Yes | NULL | Square API ID |
| square_payment_url | TEXT | Yes | NULL | Square checkout link |
| title | TEXT | No | — | |
| description | TEXT | Yes | NULL | |
| amount | DECIMAL(10,2) | No | 0 | |
| status | invoice_status | No | 'draft' | |
| sent_at | TIMESTAMPTZ | Yes | NULL | |
| viewed_at | TIMESTAMPTZ | Yes | NULL | |
| paid_at | TIMESTAMPTZ | Yes | NULL | |
| due_date | DATE | Yes | NULL | |
| created_by | UUID | No | — | FK to team_users.id |
| created_at | TIMESTAMPTZ | No | now() | |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(client_id), INDEX(project_id), INDEX(status), INDEX(square_invoice_id)
**RLS:** Team sees all. Client sees own.

---

## Table: invoice_line_items

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| invoice_id | UUID | No | — | FK to invoices.id ON DELETE CASCADE |
| description | TEXT | No | — | |
| quantity | DECIMAL(10,2) | No | 1 | |
| unit_price | DECIMAL(10,2) | No | 0 | |
| total | DECIMAL(10,2) | No | 0 | |
| sort_order | INTEGER | No | 0 | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(invoice_id)
**RLS:** Follows invoice RLS.

---

## Table: payments

Payment records (synced from Square webhooks).

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| invoice_id | UUID | No | — | FK to invoices.id |
| client_id | UUID | No | — | FK to clients.id |
| square_payment_id | TEXT | Yes | NULL | Square API ID |
| amount | DECIMAL(10,2) | No | 0 | |
| method | payment_method | No | 'square_invoice' | |
| paid_at | TIMESTAMPTZ | No | now() | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(invoice_id), INDEX(client_id), INDEX(square_payment_id)
**RLS:** Team sees all. Client sees own.

---

## Table: notifications

Notification log for all channels.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| type | notification_type | No | — | |
| channel | notification_channel | No | 'email' | |
| recipient_email | TEXT | No | — | |
| recipient_phone | TEXT | Yes | NULL | For SMS |
| subject | TEXT | Yes | NULL | Email subject |
| body | TEXT | No | — | |
| related_lead_id | UUID | Yes | NULL | FK to leads.id |
| related_project_id | UUID | Yes | NULL | FK to projects.id |
| related_invoice_id | UUID | Yes | NULL | FK to invoices.id |
| sent_at | TIMESTAMPTZ | Yes | NULL | |
| failed_at | TIMESTAMPTZ | Yes | NULL | |
| error_message | TEXT | Yes | NULL | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(type), INDEX(created_at), INDEX(related_lead_id), INDEX(related_project_id)
**RLS:** Team only.

---

## Table: activity_log

Every action taken in the CRM.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| actor_id | UUID | Yes | NULL | FK to team_users.id (null for system actions) |
| actor_type | TEXT | No | 'team' | 'team', 'client', 'system' |
| action | TEXT | No | — | e.g., 'lead.created', 'milestone.completed', 'proposal.sent' |
| entity_type | TEXT | No | — | 'lead', 'project', 'proposal', 'invoice', etc. |
| entity_id | UUID | No | — | ID of the affected record |
| metadata | JSONB | Yes | NULL | Additional context |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(actor_id), INDEX(action), INDEX(entity_type, entity_id), INDEX(created_at)
**RLS:** Team only.

---

## Table: audit_log

Destructive/sensitive admin actions with before/after state.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| actor_id | UUID | No | — | FK to team_users.id |
| action | TEXT | No | — | 'delete', 'status_change', 'permission_change', etc. |
| entity_type | TEXT | No | — | |
| entity_id | UUID | No | — | |
| before_state | JSONB | Yes | NULL | |
| after_state | JSONB | Yes | NULL | |
| ip_address | TEXT | Yes | NULL | |
| created_at | TIMESTAMPTZ | No | now() | |

**Indexes:** INDEX(actor_id), INDEX(entity_type, entity_id), INDEX(created_at)
**RLS:** Admin only.

---

## Table: system_settings

Key-value store for system configuration.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID (PK) | No | uuid_generate_v4() | |
| key | TEXT | No | — | Unique. e.g., 'stale_lead_days', 'default_terms' |
| value | JSONB | No | — | |
| updated_by | UUID | Yes | NULL | FK to team_users.id |
| updated_at | TIMESTAMPTZ | No | now() | |

**Indexes:** UNIQUE(key)
**RLS:** Team read. Admin write.

---

## Default Project Phases Template

When a project is created, auto-generate:

| Phase | Sort | Milestones |
|-------|------|-----------|
| Discovery | 1 | Initial consultation, Requirements documented, Project plan approved |
| MVP Build | 2 | Dev environment setup, Core features implemented, Internal testing passed |
| Revision | 3 | Client feedback collected, Revisions implemented, Final testing passed |
| Launch | 4 | Deployment completed, Client training done, Project handoff complete |

Customizable per project — team can add, remove, rename, reorder.
