import { createClient, isSupabaseConfigured, resetBrowserClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_KEYS = [
  "fiscmak_profile_avatar",
  "fiscmak_mak_conversations",
  "fiscmak_demo_store",
  "fiscmak_goals",
  "fiscmak_goals_onboarding_complete",
  "fiscmak_subjective_checkin",
  "fiscmak_energy_history",
  "fiscmak_documents",
  "fiscmak_lay_of_land_tour_done",
];

const SESSION_STORAGE_KEYS = [
  "fiscmak_onboarding_next",
  "fiscmak_output_template_type",
  "fiscmak_active_document_id",
];

/** Remove client-side caches tied to the signed-in user. */
export function clearClientSessionState() {
  if (typeof window === "undefined") return;
  for (const key of LOCAL_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore quota / privacy mode */
    }
  }
  for (const key of SESSION_STORAGE_KEYS) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith("fiscmak_studio_")) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * End the session on server + client, clear local caches, and hard-navigate
 * so middleware sees fresh cookie state.
 */
export async function signOutAndRedirect(path = "/login?signed_out=1") {
  clearClientSessionState();

  if (isSupabaseConfigured()) {
    try {
      await fetch("/api/v1/auth/signout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      /* server route unavailable — still attempt client sign-out */
    }

    try {
      const supabase = createClient();
      await supabase.auth.signOut({ scope: "global" });
    } catch {
      /* proceed to redirect */
    }

    resetBrowserClient();
  }

  window.location.assign(path);
}
