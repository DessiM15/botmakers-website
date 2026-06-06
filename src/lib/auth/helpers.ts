// SPEC: CLAUDE.md > src/lib/auth/helpers.ts
// DEP-MAP: Auth > SERVER > getSession, getTeamUser, getClientUser, requireTeam, requireAdmin, requireClient
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/client";
import { getActiveTeamUserByEmail } from "@/lib/db/queries/team";
import { getClientByAuthUserId } from "@/lib/db/queries/clients";
import type { TeamUser, Client } from "@/lib/types";

/**
 * Get the current Supabase auth session user.
 * Uses auth.getUser() (server-verified) instead of getSession() (JWT-only).
 */
export async function getSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Get the current team user by matching Supabase auth email to team_users.email.
 * Returns null if not authenticated or not a team member.
 */
export async function getTeamUser(): Promise<TeamUser | null> {
  const user = await getSession();
  if (!user?.email) return null;

  return getActiveTeamUserByEmail(user.email);
}

/**
 * Get the current client by matching Supabase auth UID to clients.auth_user_id.
 * Returns null if not authenticated or not a client.
 */
export async function getClientUser(): Promise<Client | null> {
  const user = await getSession();
  if (!user) return null;

  return getClientByAuthUserId(user.id);
}

/**
 * Require an authenticated team member. Redirects to login if not.
 */
export async function requireTeam(): Promise<TeamUser> {
  const teamUser = await getTeamUser();
  if (!teamUser) redirect("/admin/login");
  return teamUser;
}

/**
 * Require an admin team member. Redirects to login if not team, throws if not admin.
 */
export async function requireAdmin(): Promise<TeamUser> {
  const teamUser = await requireTeam();
  if (teamUser.role !== "admin") {
    throw new Error("CB-AUTH-004: Admin access required");
  }
  return teamUser;
}

/**
 * Require an authenticated client. Redirects to login if not.
 */
export async function requireClient(): Promise<Client> {
  const client = await getClientUser();
  if (!client) redirect("/portal/login");
  return client;
}
