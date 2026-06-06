// SPEC: CLAUDE.md > Database client utilities
// Server + browser Supabase clients + Drizzle ORM client
import dns from "dns";
import { createServerClient, createBrowserClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Force IPv4 DNS resolution — Supabase direct connections only have AAAA (IPv6)
// records, which fail on networks without IPv6 support
dns.setDefaultResultOrder("ipv4first");

// ============================================
// Supabase Clients
// ============================================

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore;
            for (const { name, value, options } of cookiesToSet) {
              store.set(name, value, options);
            }
          } catch {
            // Called from Server Component — cookies are read-only
          }
        },
      },
    }
  );
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createSupabaseAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll();
        },
        async setAll() {
          // Admin client doesn't need to set cookies
        },
      },
    }
  );
}

// ============================================
// Drizzle ORM Client (lazy — safe during build)
// ============================================

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is required. Set it to your Supabase PostgreSQL connection string " +
        "(Supabase Dashboard > Settings > Database > Connection string > URI)."
      );
    }
    const client = postgres(connectionString, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}

/** @deprecated Use getDb() for lazy initialization. Kept for backwards compatibility. */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
