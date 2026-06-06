// SPEC: CLAUDE.md > Security > Rate limit all public endpoints
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

let _adminLoginLimiter: Ratelimit | undefined;
let _portalMagicLinkLimiter: Ratelimit | undefined;
let _leadFormLimiter: Ratelimit | undefined;
let _referralFormLimiter: Ratelimit | undefined;

/** 5 attempts per 15 minutes per IP — admin login */
export function getAdminLoginLimiter() {
  if (!_adminLoginLimiter) {
    _adminLoginLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:admin-login",
    });
  }
  return _adminLoginLimiter;
}

/** 3 attempts per hour per email — portal magic link */
export function getPortalMagicLinkLimiter() {
  if (!_portalMagicLinkLimiter) {
    _portalMagicLinkLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "ratelimit:portal-magic-link",
    });
  }
  return _portalMagicLinkLimiter;
}

/** 3 submissions per hour per IP — lead form */
export function getLeadFormLimiter() {
  if (!_leadFormLimiter) {
    _leadFormLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "ratelimit:lead-form",
    });
  }
  return _leadFormLimiter;
}

/** 3 submissions per hour per IP — referral form */
export function getReferralFormLimiter() {
  if (!_referralFormLimiter) {
    _referralFormLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "ratelimit:referral-form",
    });
  }
  return _referralFormLimiter;
}

let _bookingAvailableLimiter: Ratelimit | undefined;
let _bookingCreateLimiter: Ratelimit | undefined;

/** 20 requests per minute per IP — booking available slots */
export function getBookingAvailableLimiter() {
  if (!_bookingAvailableLimiter) {
    _bookingAvailableLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "ratelimit:booking-available",
    });
  }
  return _bookingAvailableLimiter;
}

let _amfnLoginLimiter: Ratelimit | undefined;
let _amfnChatLimiter: Ratelimit | undefined;

/** 5 attempts per 15 minutes per IP — AMFN portal login */
export function getAmfnLoginLimiter() {
  if (!_amfnLoginLimiter) {
    _amfnLoginLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:amfn-login",
    });
  }
  return _amfnLoginLimiter;
}

/** 20 questions per hour per IP — AMFN AI chatbot */
export function getAmfnChatLimiter() {
  if (!_amfnChatLimiter) {
    _amfnChatLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:amfn-chat",
    });
  }
  return _amfnChatLimiter;
}

/** 5 requests per hour per IP — booking create */
export function getBookingCreateLimiter() {
  if (!_bookingCreateLimiter) {
    _bookingCreateLimiter = new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "ratelimit:booking-create",
    });
  }
  return _bookingCreateLimiter;
}
