import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const APP_PREFIX = "/app";

const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/join",
];

const PUBLIC_MARKETING_PREFIXES = [
  "/how-it-works",
  "/meet-mak",
  "/our-narrative",
  "/institutions",
  "/faq",
  "/security",
  "/about",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  if (PUBLIC_MARKETING_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Refresh Supabase session cookies and protect authenticated app routes. */
export async function updateSession(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === "fiscmak.com") {
    const canonical = request.nextUrl.clone();
    canonical.host = "www.fiscmak.com";
    canonical.protocol = "https:";
    return NextResponse.redirect(canonical, 308);
  }

  const pathname = request.nextUrl.pathname;
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;

    const getUserResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 5000)),
    ]);

    if (getUserResult !== "timeout") {
      user = getUserResult.data.user;
    }

    if (!user && pathname.startsWith(APP_PREFIX)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch (error) {
    console.error("[middleware] session refresh failed:", error);
    return supabaseResponse;
  }
}
