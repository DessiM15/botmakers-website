import { NextRequest, NextResponse } from "next/server";
import { getReactivationEmailHTML } from "@/emails/reactivation-html";
import { getReactivationEmailText } from "@/emails/reactivation-text";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name") || "John Smith";
  const slug = request.nextUrl.searchParams.get("slug") || undefined;

  const html = getReactivationEmailHTML(name, slug);
  const text = getReactivationEmailText(name, slug);

  return NextResponse.json({ html, text });
}
