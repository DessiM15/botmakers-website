import { NextRequest } from "next/server";
import { supabaseAdmin } from "./supabase-server";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

// Check if a request has a valid admin session
export async function getAdminUser(
  request: NextRequest
): Promise<AuthUser | null> {
  // When Supabase is connected, verify the session token
  if (!supabaseAdmin) {
    // Mock mode: return a mock admin user for development
    console.warn("Auth: Supabase not configured, using mock admin user");
    return {
      id: "mock-admin-id",
      email: "dessiah@m.botmakers.ai",
      full_name: "Dee",
    };
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    // Try cookie-based session
    const cookie = request.cookies.get("sb-access-token")?.value;
    if (!cookie) return null;

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(cookie);
    if (error || !user) return null;

    // Verify user is in admin_users table
    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!adminUser) return null;

    return {
      id: adminUser.id,
      email: adminUser.email,
      full_name: adminUser.full_name,
    };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!adminUser) return null;

  return {
    id: adminUser.id,
    email: adminUser.email,
    full_name: adminUser.full_name,
  };
}

// Check if a request has a valid client session
export async function getClientUser(
  request: NextRequest
): Promise<{ id: string; email: string } | null> {
  if (!supabaseAdmin) {
    console.warn("Auth: Supabase not configured, using mock client user");
    return { id: "mock-client-id", email: "client@example.com" };
  }

  const cookie = request.cookies.get("sb-access-token")?.value;
  if (!cookie) return null;

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(cookie);
  if (error || !user || !user.email) return null;

  return { id: user.id, email: user.email };
}

// Require admin - throws 401 if not authenticated
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await getAdminUser(request);
  if (!user) {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

// Require client - throws 401 if not authenticated
export async function requireClient(
  request: NextRequest
): Promise<{ id: string; email: string }> {
  const user = await getClientUser(request);
  if (!user) {
    throw new Error("Unauthorized: Client access required");
  }
  return user;
}
