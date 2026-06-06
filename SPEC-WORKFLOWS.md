# SPEC-WORKFLOWS.md — Botmakers CRM v1

---

## WORKFLOW 1: Lead Submission (Public)

**Trigger:** Visitor fills out lead form on homepage

**Steps:**
1. Visitor fills form fields (name, email, phone, company, project type, timeline, details)
2. Client-side validation runs (all required fields, email format, min 50 chars details)
3. Form submits to POST /api/leads
4. Server validates input (same rules, server-side)
5. Rate limit check (Upstash — 3 per hour per IP)
6. Insert lead into leads table (status: 'new_lead', source: 'web_form')
7. Call Claude AI to analyze lead (score, summary, complexity, red flags)
8. Store AI analysis in ai_internal_analysis (JSONB) and ai_prospect_summary (TEXT)
9. Send team notification email (all 3 team members): "New Lead: {name} — {company}"
10. Send prospect confirmation email: "Thanks for reaching out" with AI summary
11. Log to activity_log: 'lead.created'
12. Return success response → form shows "Thank you" message

**Failure Handling:**
- Step 5 (rate limit): Return 429, show "Too many submissions. Try again later."
- Step 6 (DB insert fails): Return 500, show "Something went wrong. Please try again."
- Step 7 (AI fails): Proceed without AI analysis, set score=null, log error
- Step 9/10 (email fails): Proceed, log error. Lead is still saved.

**Edge Cases:**
- Duplicate email submitted → still create new lead (different submissions)
- Extremely long input → truncate at 5000 chars server-side
- Bot/spam submissions → rate limit + honeypot field

---

## WORKFLOW 2: Referral Submission (Public)

**Trigger:** Visitor submits referral form at /refer

**Steps:**
1. Visitor fills referral form (their info + referred contacts)
2. Upsert into referrers table (by email)
3. For each referred contact: insert into leads table (source: 'referral', referred_by: referrer.id)
4. Increment referrer.total_referrals
5. Send 3 emails: team notification, referrer thank you, referred contact outreach
6. Log to activity_log: 'referral.created'

**Status:** EXISTING workflow. Update storage from in-memory to Supabase in Stage 1.

---

## WORKFLOW 3: Pipeline Stage Change

**Trigger:** Team member moves lead to a new pipeline stage (drag on Kanban or dropdown)

**Steps:**
1. Team member changes stage (drag-and-drop or select)
2. Validate: stage is a valid pipeline_stage enum value
3. Update lead: pipeline_stage = new value, pipeline_stage_changed_at = now(), updated_at = now()
4. If new stage is 'contacted': set last_contacted_at = now()
5. Send notification to all team members: "Lead {name} moved to {stage}"
6. Log to activity_log: 'lead.stage_changed' with metadata { from: old_stage, to: new_stage }

**Failure Handling:**
- DB update fails: Show toast error, revert drag position on Kanban

**Edge Cases:**
- Moving backwards in pipeline (allowed — not linear)
- Two team members moving same lead simultaneously → last write wins, toast warning

---

## WORKFLOW 4: Lead → Client Conversion

**Trigger:** Team clicks "Convert to Client" on lead detail page

**Steps:**
1. Team clicks "Convert to Client" button
2. Confirm dialog: "Create a client record for {name}? They'll get portal access."
3. Check if client already exists with same email → if yes, link to existing client
4. If new client: Insert into clients table (name, email, company, phone from lead)
5. Create Supabase Auth account for client (supabaseAdmin.auth.admin.createUser with email_confirm: true)
6. Store auth_user_id on client record
7. Update lead: converted_to_client_id = client.id, pipeline_stage = 'contract_signed'
8. Send welcome email to client: "Welcome — Your Client Portal" with magic link CTA
9. Log to activity_log: 'lead.converted' + 'client.created'
10. Redirect to /admin/clients/[id]

**Failure Handling:**
- Step 5 (auth creation fails): Show error, client record still created but auth_user_id=null
- Existing client found: Ask "Link to existing client {name}?" instead of creating new

---

## WORKFLOW 5: AI Proposal Generation

**Trigger:** Team clicks "Generate with AI" on proposal creation page

**Steps:**
1. Team selects lead/client and pastes discovery notes
2. Team clicks "Generate with AI"
3. POST to /api/ai/generate-proposal with: lead data, AI analysis (if exists), discovery notes, pricing type
4. Claude generates: scope_of_work, deliverables, terms_and_conditions, suggested line items
5. Response populates form fields — all editable
6. Team reviews, edits as needed
7. Team adds/adjusts line items (description, quantity, unit_price)
8. Total auto-calculates
9. Team clicks "Save Draft" → proposal saved with status 'draft'
10. OR team clicks "Send to Client" → sends email + sets status 'sent'
11. Log to activity_log: 'proposal.created' (and 'proposal.sent' if sent)

**AI Prompt Context:**
```
System: You are a proposal writer for Botmakers.ai, an AI-accelerated software development company in Katy, Texas. Generate professional, clear proposals.

Input: Lead name, company, project type, project details, AI analysis (if available), discovery notes, pricing type.

Output JSON: { scope_of_work, deliverables, terms_and_conditions, suggested_line_items: [{ description, quantity, unit_price }] }
```

**Failure Handling:**
- AI fails: Show toast "AI generation failed. You can fill in the fields manually."

---

## WORKFLOW 6: Proposal Acceptance (Client)

**Trigger:** Client clicks "Accept & Sign" on proposal in portal

**Steps:**
1. Client receives email "Proposal from Botmakers.ai"
2. Client clicks link → /portal/proposals/[id]
3. Client reviews scope, deliverables, terms, pricing
4. Update proposal: viewed_at = now(), status = 'viewed'
5. Client checks "I agree" checkbox + types full name as signature
6. Client clicks "Accept & Sign"
7. Update proposal: status = 'accepted', accepted_at = now(), client_signature = typed name
8. Send notification to all team members: "Proposal {title} accepted by {client}!"
9. Log to activity_log: 'proposal.accepted'
10. If auto-create project: Create project from proposal data (optional — team configures)

**Edge Cases:**
- Proposal expired (past expires_at): Show "This proposal has expired. Contact Botmakers.ai."
- Already accepted: Show acceptance confirmation, no re-accept
- Already declined: Show "You declined this proposal on [date]."

---

## WORKFLOW 7: Milestone Completion → Auto Invoice

**Trigger:** Team marks a milestone as 'completed'

**Steps:**
1. Team changes milestone status to 'completed' via dropdown
2. Confirm dialog: "Mark as complete? Client will be notified."
3. Update milestone: status = 'completed', completed_at = now()
4. If milestone.triggers_invoice = true:
   a. Create invoice in CRM (amount = milestone.invoice_amount)
   b. Create Square invoice via Square API
   c. Store square_invoice_id and square_payment_url on invoice record
   d. If auto-send configured: Send Square invoice to client email
5. Send milestone notification email to client: "Project Update: {milestone} is complete!"
6. Check if all milestones in phase are complete → if yes, log 'phase.completed'
7. Recalculate project progress percentage
8. Log to activity_log: 'milestone.completed'

**Failure Handling:**
- Square API fails: Create invoice in CRM with square_invoice_id=null, show warning "Square sync failed — create invoice manually"
- Email fails: Proceed, log error

---

## WORKFLOW 8: Client Question → AI-Polished Reply

**Trigger:** Client submits question in portal

**Steps:**
1. Client types question (min 10 chars) in /portal/projects/[id]
2. Client clicks "Submit Question"
3. Insert into project_questions (status: 'pending')
4. Send notification email to all team members: "[Client Question] {client} asked about {project}"
5. Log to activity_log: 'question.submitted'

**Reply flow (Team):**
6. Team opens question in /admin/projects/[id] > Questions tab
7. Team types reply_draft in textarea
8. Team clicks "Polish with AI" → POST /api/ai/polish-reply
9. Claude refines draft → show polished version in preview panel
10. Team can "Edit" polished version or accept as-is
11. Team clicks "Send Reply"
12. Update question: reply_text = final, reply_draft = original, replied_by, replied_at, status = 'replied'
13. Send email to client: "Re: Your question about {project}"
14. Log to activity_log: 'question.replied'

---

## WORKFLOW 9: Square Payment Received (Webhook)

**Trigger:** Square sends payment.completed webhook

**Steps:**
1. POST /api/webhooks/square receives webhook
2. Verify webhook signature (Square HMAC)
3. Extract payment_id and invoice_id from payload
4. Find invoice in CRM by square_invoice_id
5. Update invoice: status = 'paid', paid_at = now()
6. Insert into payments table (amount, method, square_payment_id)
7. Send notification to team: "Payment received: ${amount} from {client}"
8. Send receipt confirmation to client: "Payment confirmed for {invoice_title}"
9. Log to activity_log: 'payment.received'

**Failure Handling:**
- Invoice not found in CRM: Log warning, do not crash webhook handler
- Duplicate webhook (idempotency): Check if payment already recorded, skip if exists

---

## WORKFLOW 10: GitHub Repo Sync

**Trigger:** Team attaches repo to project or manual sync

**Steps:**
1. Team enters GitHub owner/repo on project Repos tab
2. Validate repo exists via GitHub API (GET /repos/{owner}/{repo})
3. If valid: Insert into project_repos
4. Fetch last 10 commits from default branch
5. Display branch names, commit messages, timestamps, authors in CRM
6. Optionally: Set up webhook for push events (POST /api/webhooks/github)

**On webhook push event:**
7. Receive push webhook → verify signature
8. Update project_repos.last_synced_at
9. Store latest commit info
10. Log to activity_log: 'repo.push_received'

**Failure Handling:**
- Repo not found (404): Show "Repository not found. Check the owner and repo name."
- GitHub rate limit: Show "GitHub API rate limit reached. Try again later."
- No GitHub token configured: Show "Set up GitHub in Settings > Integrations first."

---

## WORKFLOW 11: Vercel Preview URL Auto-Pull

**Trigger:** Vercel deployment webhook fires

**Steps:**
1. POST /api/webhooks/vercel receives deployment webhook
2. Verify webhook signature
3. Extract deployment URL and project/repo info
4. Match to project_repos by github_owner + github_repo
5. If match found: Insert into project_demos (is_auto_pulled=true, is_approved=false)
6. Demo appears in CRM project detail — team can approve for client visibility
7. Log to activity_log: 'demo.auto_pulled'

**Edge Cases:**
- No matching project: Log, ignore (deployment for non-CRM project)
- Duplicate URL: Skip if URL already exists in demos

---

## WORKFLOW 12: Stale Lead Detection (Cron)

**Trigger:** Daily cron job (/api/cron/stale-leads)

**Steps:**
1. Cron runs at 8am CT (configurable via Vercel cron)
2. Verify CRON_SECRET header
3. Query leads where: pipeline_stage IN ('new_lead', 'contacted', 'discovery_scheduled') AND last_contacted_at < now() - system_settings['stale_lead_days'] (default: 7 days)
4. For each stale lead: Send notification email to assigned_to (or all team if unassigned)
5. Log to activity_log: 'lead.stale_alert'

---

## WORKFLOW 13: Overdue Milestone Detection (Cron)

**Trigger:** Daily cron job (/api/cron/overdue-milestones)

**Steps:**
1. Cron runs at 8am CT
2. Verify CRON_SECRET header
3. Query milestones where: status IN ('pending', 'in_progress') AND due_date < today
4. Update status to 'overdue' for any that aren't already
5. Send notification to team: "{count} milestones overdue across {count} projects"
6. Log to activity_log: 'milestone.overdue_alert'

---

## WORKFLOW 14: Manual Invoice Creation + Square Sync

**Trigger:** Team creates invoice from /admin/invoices/new or project detail

**Steps:**
1. Team fills: client, project (optional), title, line items, due date
2. Total auto-calculates from line items
3. Team clicks "Save Draft" → invoice saved, status = 'draft'
4. Team clicks "Send via Square":
   a. Create invoice in Square API
   b. Store square_invoice_id and square_payment_url
   c. Square sends invoice email to client
   d. Update status = 'sent', sent_at = now()
5. OR team clicks "Generate Payment Link":
   a. Create Square Checkout link
   b. Store square_payment_url
   c. Team can copy link and send manually
6. Log to activity_log: 'invoice.created' / 'invoice.sent'

**Failure Handling:**
- Square API fails: Save draft locally, show "Square sync failed. Invoice saved as draft."
