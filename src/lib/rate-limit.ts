// Rate limiting using Upstash Redis.
// Once UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set,
// this will enforce 3 submissions per IP per hour.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[Rate Limit] Upstash not configured — rate limiting disabled");
    return null;
  }

  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "botmakers:leads",
  });

  return ratelimit;
}

export async function checkRateLimit(
  ip: string
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getRateLimiter();
  if (!limiter) return { success: true, remaining: 999 };

  const result = await limiter.limit(ip);
  return { success: result.success, remaining: result.remaining };
}
