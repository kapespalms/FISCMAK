import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/** Ensures FISCMAK users + profiles rows exist for the signed-in auth user. */
export async function ensureAppUser(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error: userError } = await supabase.from("users").insert({
      id: user.id,
      email: user.email ?? "",
    });
    if (userError && !userError.message.includes("duplicate")) {
      throw userError;
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: user.id });
    if (profileError && !profileError.message.includes("duplicate")) {
      throw profileError;
    }
  }
}
