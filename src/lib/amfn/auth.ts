import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const COOKIE_NAME = "amfn_session";
const COOKIE_VALUE = "authenticated";
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;

export function getAmfnCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  };
}

export async function isAmfnAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value === COOKIE_VALUE;
}

export function getAmfnCookieName(): string {
  return COOKIE_NAME;
}

export function getAmfnCookieValue(): string {
  return COOKIE_VALUE;
}
