// SPEC: SPEC-DEPENDENCY-MAP.md > CROSS-CUTTING > ENV VALIDATION
// Validates ALL env vars on first access. App refuses to start if required vars missing.
import { z } from "zod";

const envSchema = z.object({
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Botmakers CRM"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Supabase (required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL is required and must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required (Supabase PostgreSQL connection string)"),

  // Email — Resend (required)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().default("info@botmakers.ai"),
  EMAIL_LEADS_FROM: z.string().default("leads@botmakers.ai"),

  // AI — Anthropic (required)
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),

  // Rate limiting — Upstash (required)
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL is required"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),

  // Payments — Square (optional — billing features won't work without)
  SQUARE_ACCESS_TOKEN: z.string().optional(),
  SQUARE_LOCATION_ID: z.string().optional(),
  SQUARE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().optional(),

  // VCS — GitHub (optional — repo integration won't work without)
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),

  // Vercel (optional)
  VERCEL_WEBHOOK_SECRET: z.string().optional(),

  // Google Calendar (optional — calendar integration)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),

  // Cron (optional — cron jobs won't work without)
  CRON_SECRET: z.string().optional(),

  // SMS — Twilio (optional — app gracefully skips SMS)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // AMFN client portal (optional)
  AMFN_PORTAL_PASSWORD: z.string().optional(),

  // Team emails
  TEAM_NOTIFICATION_EMAILS: z.string().default(""),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    throw new Error(
      `Missing or invalid environment variables:\n${errorMessages}\n\nSee .env.example for required values.`
    );
  }

  return parsed.data;
}

/**
 * Validated environment variables.
 * Throws a descriptive error on first access if required vars are missing.
 * Cached after first successful validation.
 */
export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

/**
 * Proxy-based env export for convenient access (env.SOME_VAR).
 * Validates lazily on first property access so builds succeed without env vars.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
