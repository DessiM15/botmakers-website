// SPEC: Google Calendar Integration > OAuth callback
import { NextRequest, NextResponse } from "next/server";
import { requireTeam } from "@/lib/auth/helpers";
import {
  exchangeCodeForTokens,
  getGoogleUserEmail,
} from "@/lib/integrations/google-calendar";
import { connectGoogleCalendar } from "@/lib/actions/calendar";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  await requireTeam();

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/admin/settings?google=error", APP_URL)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      console.error("[CB-INT-006] No refresh token returned from Google");
      return NextResponse.redirect(
        new URL("/admin/settings?google=error", APP_URL)
      );
    }

    const email = await getGoogleUserEmail(tokens.refresh_token);
    await connectGoogleCalendar(
      tokens.refresh_token,
      email ?? "unknown"
    );

    return NextResponse.redirect(
      new URL("/admin/settings?google=connected", APP_URL)
    );
  } catch (err) {
    console.error("[CB-INT-006] Google OAuth callback failed:", err);
    return NextResponse.redirect(
      new URL("/admin/settings?google=error", APP_URL)
    );
  }
}
