import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { jsonError } from "@/lib/v2/api-helpers";

function jsonWithSessionCookies(
  body: Record<string, unknown>,
  status: number,
  sessionResponse: NextResponse,
) {
  const res = NextResponse.json(body, { status });
  sessionResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    res.cookies.set(name, value, options);
  });
  return res;
}

/** Delegates to Supabase Auth; sets session cookies on the response. */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        user_id: "demo-user",
        email: "demo@fiscmak.app",
      });
    }

    const body = await request.json().catch(() => ({}));
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      return jsonError("validation_error", "Email and password required", 400);
    }

    let sessionResponse = NextResponse.next({ request });

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          sessionResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            sessionResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return jsonError("auth_error", error.message, 401);
    }

    return jsonWithSessionCookies(
      {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user_id: data.user?.id,
        email: data.user?.email,
      },
      200,
      sessionResponse,
    );
  } catch (error) {
    console.error("[auth/login] POST failed:", error);
    return jsonError("internal_error", "Sign-in failed. Please try again.", 500);
  }
}
