import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { displayNameFromAuthUser } from "@/lib/auth/oauth";

/** Ensures V2 app_users + user_settings rows exist for the signed-in auth user. */
export async function ensureAppUser(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { data: existing } = await supabase
    .from("app_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("app_users").insert({
      user_id: user.id,
      email: user.email ?? "",
      name: displayNameFromAuthUser(user),
    });
    if (error && !error.message.includes("duplicate")) {
      throw error;
    }
    await supabase.from("user_settings").upsert({ user_id: user.id });
  }
}
