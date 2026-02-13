import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Verify the email exists as a client on at least one project
    const { data: projects } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("client_email", email.toLowerCase().trim())
      .limit(1);

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        { error: "No projects found for this email address." },
        { status: 404 }
      );
    }

    // Send magic link via Supabase Auth
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabaseAdmin.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${siteUrl}/portal`,
      },
    });

    if (error) {
      console.error("[Portal Auth] Magic link error:", error);
      return NextResponse.json(
        { error: "Failed to send login link. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Magic link sent. Check your email.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
