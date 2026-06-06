-- ============================================
-- Botmakers CRM — Combined Schema + RLS Migration
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: Schema (20 tables, 12 enums, indexes, foreign keys)
-- ============================================

CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE "public"."lead_score" AS ENUM('high', 'medium', 'low');
CREATE TYPE "public"."lead_source" AS ENUM('web_form', 'referral', 'vapi', 'cold_outreach', 'word_of_mouth', 'other');
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'completed', 'overdue');
CREATE TYPE "public"."notification_channel" AS ENUM('email', 'sms', 'in_app');
CREATE TYPE "public"."notification_type" AS ENUM('lead_new', 'lead_stage_change', 'proposal_accepted', 'payment_received', 'client_question', 'milestone_overdue', 'lead_stale', 'demo_shared', 'milestone_completed');
CREATE TYPE "public"."payment_method" AS ENUM('square_invoice', 'square_checkout', 'manual', 'other');
CREATE TYPE "public"."pipeline_stage" AS ENUM('new_lead', 'contacted', 'discovery_scheduled', 'discovery_completed', 'proposal_sent', 'negotiation', 'contract_signed', 'active_client', 'project_delivered', 'retention');
CREATE TYPE "public"."pricing_type" AS ENUM('fixed', 'phased', 'hourly');
CREATE TYPE "public"."project_status" AS ENUM('draft', 'in_progress', 'paused', 'completed', 'cancelled');
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'viewed', 'accepted', 'declined', 'expired');
CREATE TYPE "public"."question_status" AS ENUM('pending', 'replied');
CREATE TYPE "public"."team_role" AS ENUM('admin', 'member');
CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_type" text DEFAULT 'team' NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"before_state" jsonb,
	"after_state" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"company" text,
	"phone" text,
	"notes" text,
	"auth_user_id" uuid,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"client_id" uuid,
	"type" text NOT NULL,
	"subject" text,
	"body" text,
	"direction" text DEFAULT 'outbound' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"project_id" uuid,
	"milestone_id" uuid,
	"square_invoice_id" text,
	"square_payment_url" text,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"viewed_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"due_date" date,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company_name" text,
	"project_type" text,
	"project_timeline" text,
	"existing_systems" text,
	"referral_source" text,
	"preferred_contact" text DEFAULT 'email' NOT NULL,
	"project_details" text,
	"sms_consent" boolean DEFAULT false NOT NULL,
	"sms_consent_timestamp" timestamp with time zone,
	"sms_consent_ip" text,
	"sms_opted_out" boolean DEFAULT false NOT NULL,
	"source" "lead_source" DEFAULT 'web_form' NOT NULL,
	"score" "lead_score",
	"pipeline_stage" "pipeline_stage" DEFAULT 'new_lead' NOT NULL,
	"pipeline_stage_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ai_internal_analysis" jsonb,
	"ai_prospect_summary" text,
	"referred_by" uuid,
	"referral_email_sent" boolean DEFAULT false NOT NULL,
	"referral_email_sent_at" timestamp with time zone,
	"converted_to_client_id" uuid,
	"assigned_to" uuid,
	"notes" text,
	"last_contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "notification_type" NOT NULL,
	"channel" "notification_channel" DEFAULT 'email' NOT NULL,
	"recipient_email" text NOT NULL,
	"recipient_phone" text,
	"subject" text,
	"body" text NOT NULL,
	"related_lead_id" uuid,
	"related_project_id" uuid,
	"related_invoice_id" uuid,
	"sent_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"square_payment_id" text,
	"amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"method" "payment_method" DEFAULT 'square_invoice' NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "project_demos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"phase_id" uuid,
	"is_auto_pulled" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"phase_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"triggers_invoice" boolean DEFAULT false NOT NULL,
	"invoice_amount" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "project_phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "project_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"reply_draft" text,
	"reply_text" text,
	"replied_by" uuid,
	"replied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "project_repos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"github_owner" text NOT NULL,
	"github_repo" text NOT NULL,
	"github_url" text NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"client_id" uuid NOT NULL,
	"proposal_id" uuid,
	"lead_id" uuid,
	"project_type" text,
	"description" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"pricing_type" "pricing_type" DEFAULT 'fixed' NOT NULL,
	"total_value" numeric(10, 2) DEFAULT '0' NOT NULL,
	"start_date" date,
	"target_end_date" date,
	"actual_end_date" date,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "proposal_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1' NOT NULL,
	"unit_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"phase_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"client_id" uuid,
	"project_id" uuid,
	"title" text NOT NULL,
	"scope_of_work" text NOT NULL,
	"deliverables" text NOT NULL,
	"terms_and_conditions" text NOT NULL,
	"pricing_type" "pricing_type" DEFAULT 'fixed' NOT NULL,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"viewed_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"declined_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"client_signature" text,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"ai_prompt_context" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "referrers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"feedback" text,
	"ai_feedback_analysis" jsonb,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"from_param" text,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "system_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "team_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" "team_role" DEFAULT 'member' NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_team_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_team_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_team_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_created_by_team_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_milestone_id_project_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."project_milestones"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_team_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "leads" ADD CONSTRAINT "leads_referred_by_referrers_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."referrers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_to_client_id_clients_id_fk" FOREIGN KEY ("converted_to_client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_team_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_lead_id_leads_id_fk" FOREIGN KEY ("related_lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_invoice_id_invoices_id_fk" FOREIGN KEY ("related_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "project_demos" ADD CONSTRAINT "project_demos_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_demos" ADD CONSTRAINT "project_demos_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "project_demos" ADD CONSTRAINT "project_demos_created_by_team_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_questions" ADD CONSTRAINT "project_questions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "project_questions" ADD CONSTRAINT "project_questions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "project_questions" ADD CONSTRAINT "project_questions_replied_by_team_users_id_fk" FOREIGN KEY ("replied_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "project_repos" ADD CONSTRAINT "project_repos_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_team_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "proposal_line_items" ADD CONSTRAINT "proposal_line_items_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_team_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_team_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."team_users"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "activity_log_actor_id_idx" ON "activity_log" USING btree ("actor_id");
CREATE INDEX "activity_log_action_idx" ON "activity_log" USING btree ("action");
CREATE INDEX "activity_log_entity_idx" ON "activity_log" USING btree ("entity_type","entity_id");
CREATE INDEX "activity_log_created_at_idx" ON "activity_log" USING btree ("created_at");
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log" USING btree ("actor_id");
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");
CREATE UNIQUE INDEX "clients_email_idx" ON "clients" USING btree ("email");
CREATE INDEX "clients_auth_user_id_idx" ON "clients" USING btree ("auth_user_id");
CREATE INDEX "contacts_lead_id_idx" ON "contacts" USING btree ("lead_id");
CREATE INDEX "contacts_client_id_idx" ON "contacts" USING btree ("client_id");
CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items" USING btree ("invoice_id");
CREATE INDEX "invoices_client_id_idx" ON "invoices" USING btree ("client_id");
CREATE INDEX "invoices_project_id_idx" ON "invoices" USING btree ("project_id");
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");
CREATE INDEX "invoices_square_invoice_id_idx" ON "invoices" USING btree ("square_invoice_id");
CREATE INDEX "leads_pipeline_stage_idx" ON "leads" USING btree ("pipeline_stage");
CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
CREATE INDEX "leads_score_idx" ON "leads" USING btree ("score");
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
CREATE INDEX "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to");
CREATE INDEX "leads_last_contacted_at_idx" ON "leads" USING btree ("last_contacted_at");
CREATE INDEX "leads_converted_to_client_id_idx" ON "leads" USING btree ("converted_to_client_id");
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
CREATE INDEX "notifications_related_lead_id_idx" ON "notifications" USING btree ("related_lead_id");
CREATE INDEX "notifications_related_project_id_idx" ON "notifications" USING btree ("related_project_id");
CREATE INDEX "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");
CREATE INDEX "payments_client_id_idx" ON "payments" USING btree ("client_id");
CREATE INDEX "payments_square_payment_id_idx" ON "payments" USING btree ("square_payment_id");
CREATE INDEX "project_demos_project_id_idx" ON "project_demos" USING btree ("project_id");
CREATE INDEX "project_demos_is_approved_idx" ON "project_demos" USING btree ("is_approved");
CREATE INDEX "project_milestones_project_id_idx" ON "project_milestones" USING btree ("project_id");
CREATE INDEX "project_milestones_phase_id_idx" ON "project_milestones" USING btree ("phase_id");
CREATE INDEX "project_milestones_status_idx" ON "project_milestones" USING btree ("status");
CREATE INDEX "project_milestones_due_date_idx" ON "project_milestones" USING btree ("due_date");
CREATE INDEX "project_phases_project_id_sort_idx" ON "project_phases" USING btree ("project_id","sort_order");
CREATE INDEX "project_questions_project_id_idx" ON "project_questions" USING btree ("project_id");
CREATE INDEX "project_questions_client_id_idx" ON "project_questions" USING btree ("client_id");
CREATE INDEX "project_questions_status_idx" ON "project_questions" USING btree ("status");
CREATE INDEX "project_repos_project_id_idx" ON "project_repos" USING btree ("project_id");
CREATE UNIQUE INDEX "project_repos_unique_idx" ON "project_repos" USING btree ("project_id","github_owner","github_repo");
CREATE INDEX "projects_client_id_idx" ON "projects" USING btree ("client_id");
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");
CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
CREATE INDEX "proposal_line_items_proposal_id_idx" ON "proposal_line_items" USING btree ("proposal_id");
CREATE INDEX "proposals_lead_id_idx" ON "proposals" USING btree ("lead_id");
CREATE INDEX "proposals_client_id_idx" ON "proposals" USING btree ("client_id");
CREATE INDEX "proposals_project_id_idx" ON "proposals" USING btree ("project_id");
CREATE INDEX "proposals_status_idx" ON "proposals" USING btree ("status");
CREATE INDEX "proposals_created_at_idx" ON "proposals" USING btree ("created_at");
CREATE UNIQUE INDEX "referrers_slug_idx" ON "referrers" USING btree ("slug");
CREATE UNIQUE INDEX "referrers_email_idx" ON "referrers" USING btree ("email");
CREATE UNIQUE INDEX "system_settings_key_idx" ON "system_settings" USING btree ("key");
CREATE UNIQUE INDEX "team_users_email_idx" ON "team_users" USING btree ("email");

-- ============================================
-- PART 2: RLS policies + helper functions
-- ============================================

-- SPEC: CLAUDE.md > Security > RLS enforced on all tables
-- Stage 2: Enable RLS + policies for all 20 tables

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER to avoid RLS recursion)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_users
    WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_users
    WHERE email = (auth.jwt() ->> 'email')
      AND is_active = true
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT id FROM public.clients
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- ============================================
-- team_users: team read, admin write
-- ============================================
ALTER TABLE team_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_users_select" ON team_users
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "team_users_insert" ON team_users
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "team_users_update" ON team_users
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "team_users_delete" ON team_users
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================
-- clients: team all, client own read
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_team_select" ON clients
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "clients_client_select" ON clients
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "clients_team_insert" ON clients
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "clients_team_update" ON clients
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "clients_team_delete" ON clients
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- leads: anon insert (web form), team all
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_anon_insert" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "leads_team_select" ON leads
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "leads_team_insert" ON leads
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "leads_team_update" ON leads
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "leads_team_delete" ON leads
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- referrers: anon insert, team all
-- ============================================
ALTER TABLE referrers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrers_anon_insert" ON referrers
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "referrers_team_select" ON referrers
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "referrers_team_insert" ON referrers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "referrers_team_update" ON referrers
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "referrers_team_delete" ON referrers
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- contacts: team all
-- ============================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_team_select" ON contacts
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "contacts_team_insert" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "contacts_team_update" ON contacts
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "contacts_team_delete" ON contacts
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- proposals: team all, client read own (non-draft)
-- ============================================
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_team_select" ON proposals
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "proposals_client_select" ON proposals
  FOR SELECT TO authenticated
  USING (
    client_id = public.current_client_id()
    AND status != 'draft'
  );

CREATE POLICY "proposals_team_insert" ON proposals
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "proposals_team_update" ON proposals
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "proposals_team_delete" ON proposals
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- proposal_line_items: team all, client read (via proposal)
-- ============================================
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposal_line_items_team_select" ON proposal_line_items
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "proposal_line_items_client_select" ON proposal_line_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = proposal_line_items.proposal_id
        AND proposals.client_id = public.current_client_id()
        AND proposals.status != 'draft'
    )
  );

CREATE POLICY "proposal_line_items_team_insert" ON proposal_line_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "proposal_line_items_team_update" ON proposal_line_items
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "proposal_line_items_team_delete" ON proposal_line_items
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- projects: team all, client read own
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_team_select" ON projects
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "projects_client_select" ON projects
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

CREATE POLICY "projects_team_insert" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "projects_team_update" ON projects
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "projects_team_delete" ON projects
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- project_phases: team all, client read (via project)
-- ============================================
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_phases_team_select" ON project_phases
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "project_phases_client_select" ON project_phases
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_phases.project_id
        AND projects.client_id = public.current_client_id()
    )
  );

CREATE POLICY "project_phases_team_insert" ON project_phases
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_phases_team_update" ON project_phases
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_phases_team_delete" ON project_phases
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- project_milestones: team all, client read (via project)
-- ============================================
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_milestones_team_select" ON project_milestones
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "project_milestones_client_select" ON project_milestones
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_milestones.project_id
        AND projects.client_id = public.current_client_id()
    )
  );

CREATE POLICY "project_milestones_team_insert" ON project_milestones
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_milestones_team_update" ON project_milestones
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_milestones_team_delete" ON project_milestones
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- project_repos: team only
-- ============================================
ALTER TABLE project_repos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_repos_team_select" ON project_repos
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "project_repos_team_insert" ON project_repos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_repos_team_update" ON project_repos
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_repos_team_delete" ON project_repos
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- project_demos: team all, client read (approved + own project)
-- ============================================
ALTER TABLE project_demos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_demos_team_select" ON project_demos
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "project_demos_client_select" ON project_demos
  FOR SELECT TO authenticated
  USING (
    is_approved = true
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_demos.project_id
        AND projects.client_id = public.current_client_id()
    )
  );

CREATE POLICY "project_demos_team_insert" ON project_demos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_demos_team_update" ON project_demos
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_demos_team_delete" ON project_demos
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- project_questions: team all, client read+insert own
-- ============================================
ALTER TABLE project_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_questions_team_select" ON project_questions
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "project_questions_client_select" ON project_questions
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

CREATE POLICY "project_questions_team_insert" ON project_questions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_questions_client_insert" ON project_questions
  FOR INSERT TO authenticated
  WITH CHECK (client_id = public.current_client_id());

CREATE POLICY "project_questions_team_update" ON project_questions
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "project_questions_team_delete" ON project_questions
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- invoices: team all, client read own
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_team_select" ON invoices
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "invoices_client_select" ON invoices
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

CREATE POLICY "invoices_team_insert" ON invoices
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "invoices_team_update" ON invoices
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "invoices_team_delete" ON invoices
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- invoice_line_items: team all, client read (via invoice)
-- ============================================
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_line_items_team_select" ON invoice_line_items
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "invoice_line_items_client_select" ON invoice_line_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
        AND invoices.client_id = public.current_client_id()
    )
  );

CREATE POLICY "invoice_line_items_team_insert" ON invoice_line_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "invoice_line_items_team_update" ON invoice_line_items
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "invoice_line_items_team_delete" ON invoice_line_items
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- payments: team all, client read own
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_team_select" ON payments
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "payments_client_select" ON payments
  FOR SELECT TO authenticated
  USING (client_id = public.current_client_id());

CREATE POLICY "payments_team_insert" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "payments_team_update" ON payments
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "payments_team_delete" ON payments
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- notifications: team only
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_team_select" ON notifications
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "notifications_team_insert" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

CREATE POLICY "notifications_team_update" ON notifications
  FOR UPDATE TO authenticated
  USING (public.is_team_member())
  WITH CHECK (public.is_team_member());

CREATE POLICY "notifications_team_delete" ON notifications
  FOR DELETE TO authenticated
  USING (public.is_team_member());

-- ============================================
-- activity_log: team only
-- ============================================
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_team_select" ON activity_log
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "activity_log_team_insert" ON activity_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

-- ============================================
-- audit_log: admin read only
-- ============================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_admin_select" ON audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "audit_log_team_insert" ON audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member());

-- ============================================
-- system_settings: team read, admin write
-- ============================================
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_team_select" ON system_settings
  FOR SELECT TO authenticated
  USING (public.is_team_member());

CREATE POLICY "system_settings_admin_insert" ON system_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "system_settings_admin_update" ON system_settings
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "system_settings_admin_delete" ON system_settings
  FOR DELETE TO authenticated
  USING (public.is_admin());
