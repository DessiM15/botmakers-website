import { NextRequest, NextResponse } from "next/server";
import { getAmfnCookieName } from "@/lib/amfn/auth";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/amfn", request.url));
  response.cookies.set(getAmfnCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
