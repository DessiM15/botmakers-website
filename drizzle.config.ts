import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "postgresql://postgres:postgres@").replace(".supabase.co", ".supabase.co:5432/postgres")}`
      : "postgresql://localhost:5432/botmakers",
  },
});
