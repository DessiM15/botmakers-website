// SPEC: Google Calendar Integration > OAuth redirect
import { NextResponse } from "next/server";
import { requireTeam } from "@/lib/auth/helpers";
import {
  getGoogleAuthUrl,
  isGoogleCalendarConfigured,
} from "@/lib/integrations/google-calendar";

export async function GET() {
  await requireTeam();

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/settings?google=not_configured", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }

  const authUrl = getGoogleAuthUrl();
  return NextResponse.redirect(authUrl);
}
