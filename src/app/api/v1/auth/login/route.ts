import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { jsonError, jsonOk } from "@/lib/v2/api-helpers";

/** Validates credentials via Supabase Auth; client establishes browser session from tokens. */
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonOk({
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

    const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return jsonError("auth_error", error.message, 401);
    }

    if (!data.session?.access_token || !data.session.refresh_token) {
      return jsonError(
        "auth_error",
        "Sign-in did not create a session. Confirm your email or reset your password.",
        401,
      );
    }

    return jsonOk({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user?.id,
      email: data.user?.email,
    });
  } catch (error) {
    console.error("[auth/login] POST failed:", error);
    return jsonError("internal_error", "Sign-in failed. Please try again.", 500);
  }
}
