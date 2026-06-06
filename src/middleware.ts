// SPEC: CLAUDE.md > src/middleware.ts — Route protection
// Refreshes session, redirects unauthenticated users, redirects authenticated away from login
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // AMFN portal auth — cookie-based, no Supabase needed
  if (pathname.startsWith("/amfn/portal")) {
    const amfnSession = request.cookies.get("amfn_session");
    if (!amfnSession || amfnSession.value !== "authenticated") {
      return NextResponse.redirect(new URL("/amfn", request.url));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected routes
  if (!user) {
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (pathname.startsWith("/portal") && pathname !== "/portal/login") {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
  }

  // Redirect authenticated users away from login pages
  if (user) {
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (pathname === "/portal/login") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/amfn/portal/:path*"],
};
