// Seed script: create founding team auth users + team_users records
// Uses Supabase Admin API (service role key) — bypasses RLS
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEAM_MEMBERS = [
  { email: "dessiah@m.botmakers.ai", fullName: "Dee", role: "admin" },
  { email: "jay@m.botmakers.ai", fullName: "Jay", role: "admin" },
  { email: "tdaniel@botmakers.ai", fullName: "Trent", role: "admin" },
];

const PASSWORD = "Botmakers2026!";

async function seed() {
  console.log("=== Seeding Team Users ===\n");

  for (const member of TEAM_MEMBERS) {
    // 1. Create or update Supabase Auth user
    console.log(`[Auth] Creating auth user: ${member.email}`);
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: member.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: member.fullName },
      });

    if (authError) {
      if (authError.message?.includes("already been registered")) {
        console.log(`  -> Already exists, updating password...`);
        // Find existing user
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData?.users?.find((u) => u.email === member.email);
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, {
            password: PASSWORD,
            email_confirm: true,
          });
          console.log(`  -> Password updated for ${member.email}`);
        }
      } else {
        console.error(`  -> Auth error: ${authError.message}`);
        continue;
      }
    } else {
      console.log(`  -> Auth user created: ${authUser.user.id}`);
    }

    // 2. Upsert into team_users table (service role bypasses RLS)
    console.log(`[DB] Upserting team_users: ${member.email}`);
    const { error: dbError } = await supabase
      .from("team_users")
      .upsert(
        {
          email: member.email,
          full_name: member.fullName,
          role: member.role,
          is_active: true,
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error(`  -> DB error: ${dbError.message}`);
    } else {
      console.log(`  -> team_users record OK`);
    }

    console.log("");
  }

  // 3. Verify
  console.log("=== Verification ===\n");
  const { data: rows, error: verifyError } = await supabase
    .from("team_users")
    .select("id, email, full_name, role, is_active");

  if (verifyError) {
    console.error("Verify error:", verifyError.message);
  } else {
    console.log(`team_users has ${rows.length} record(s):`);
    for (const row of rows) {
      console.log(`  - ${row.full_name} <${row.email}> role=${row.role} active=${row.is_active}`);
    }
  }

  console.log("\n=== Done ===");
  console.log(`All users can log in with password: ${PASSWORD}`);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
