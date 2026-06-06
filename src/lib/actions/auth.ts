// SPEC: CLAUDE.md > Use Server Actions for mutations
// DEP-MAP: Auth > SERVER > loginTeam, sendPortalMagicLink, logoutTeam, logoutClient
"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/client";
import { getActiveTeamUserByEmail } from "@/lib/db/queries/team";
import { getClientByEmail } from "@/lib/db/queries/clients";
import { getAdminLoginLimiter, getPortalMagicLinkLimiter } from "@/lib/rate-limit";
import { teamLoginSchema, portalLoginSchema } from "@/lib/types/schemas";
import type { AuthResult } from "@/lib/types/auth";

export async function loginTeam(
  _prev: AuthResult<null> | null,
  formData: FormData
): Promise<AuthResult<null>> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = teamLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-001",
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      },
    };
  }

  const { email, password } = parsed.data;

  // Rate limit by email (acts as IP proxy for server actions)
  const { success: withinLimit } = await getAdminLoginLimiter().limit(email);
  if (!withinLimit) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-001",
        message: "Too many login attempts. Please try again in 15 minutes.",
      },
    };
  }

  // Verify user exists in team_users table
  const teamUser = await getActiveTeamUserByEmail(email);
  if (!teamUser) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-003",
        message: "Invalid credentials",
      },
    };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-001",
        message: "Invalid credentials",
      },
    };
  }

  redirect("/admin");
}

export async function sendPortalMagicLink(
  _prev: AuthResult<null> | null,
  formData: FormData
): Promise<AuthResult<null>> {
  const raw = { email: formData.get("email") };

  const parsed = portalLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-011",
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      },
    };
  }

  const { email } = parsed.data;

  // Rate limit by email
  const { success: withinLimit } = await getPortalMagicLinkLimiter().limit(email);
  if (!withinLimit) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-010",
        message: "Too many requests. Please try again in an hour.",
      },
    };
  }

  // Verify client exists
  const client = await getClientByEmail(email);
  if (!client) {
    // Return success anyway to avoid email enumeration
    return { success: true, data: null };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/portal`,
    },
  });

  if (error) {
    return {
      success: false,
      error: {
        code: "CB-AUTH-010",
        message: "Failed to send login link. Please try again.",
      },
    };
  }

  return { success: true, data: null };
}

export async function logoutTeam() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function logoutClient() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/portal/login");
}
