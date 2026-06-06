import { NextRequest, NextResponse } from "next/server";
import { getAmfnCookieOptions, getAmfnCookieName, getAmfnCookieValue } from "@/lib/amfn/auth";
import { getAmfnLoginLimiter } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const limiter = getAmfnLoginLimiter();
  const { success } = await limiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string") {
    return NextResponse.json(
      { error: "Password is required." },
      { status: 400 }
    );
  }

  const expectedPassword = process.env.AMFN_PORTAL_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.json(
      { error: "Portal is not configured. Contact BotMakers." },
      { status: 503 }
    );
  }

  if (body.password !== expectedPassword) {
    return NextResponse.json(
      { error: "Invalid password. Please try again." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    getAmfnCookieName(),
    getAmfnCookieValue(),
    getAmfnCookieOptions()
  );
  return response;
}
