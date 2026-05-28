import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/** Clear Supabase session and hard-navigate (ensures cookies and client state reset). */
export async function signOutAndRedirect(path = "/") {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  window.location.assign(path);
}
