import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { jsonOk, jsonError } from "@/lib/v2/api-helpers";

/** Delegates to Supabase Auth; returns session token for API contract compliance. */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonOk({
      access_token: "demo-token",
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
  return jsonOk({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    user_id: data.user?.id,
    email: data.user?.email,
  });
}
