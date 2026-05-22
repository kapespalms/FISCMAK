import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { upsertAppUser, jsonOk, jsonError } from "@/lib/v2/api-helpers";

/** @deprecated Use Supabase Auth signUp from the client. Ensures app_users row exists after registration. */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return jsonOk({
      user_id: "demo-user",
      email: "demo@fiscmak.app",
      message: "Demo mode — no registration required",
    });
  }
  const body = await request.json().catch(() => ({}));
  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };
  if (!email || !password) {
    return jsonError("validation_error", "Email and password required", 400);
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) {
    return jsonError("auth_error", error.message, 400);
  }
  if (data.user) {
    try {
      await upsertAppUser(data.user.id, email, { name: name ?? null }, false);
    } catch {
      /* trigger may handle */
    }
  }
  return jsonOk(
    {
      user_id: data.user?.id,
      email,
      message: "Registration successful. Check email for confirmation if required.",
    },
    201,
  );
}
