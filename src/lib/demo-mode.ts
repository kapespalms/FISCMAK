import { isSupabaseConfigured } from "@/lib/supabase/client";

/** When true, client-side localStorage fallbacks are enabled (no Supabase or explicit demo flag). */
export function isClientDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return !isSupabaseConfigured();
}

/** Server-side demo: no Supabase env vars configured. */
export function isServerDemoMode(): boolean {
  return !isSupabaseConfigured();
}
