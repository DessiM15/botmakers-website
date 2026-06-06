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
