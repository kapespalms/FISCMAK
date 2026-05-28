import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { jsonError } from "@/lib/v2/api-helpers";

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

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return jsonError("auth_error", error.message, 401);
    }

    return NextResponse.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user_id: data.user?.id,
      email: data.user?.email,
    });
  } catch (error) {
    console.error("[auth/login] POST failed:", error);
    return jsonError("internal_error", "Sign-in failed. Please try again.", 500);
  }
}
