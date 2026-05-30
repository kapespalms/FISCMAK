import {
  FISCMAK_SUPABASE_ANON_KEY,
  FISCMAK_SUPABASE_URL,
} from "@/lib/supabase/public-config";

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseUrl() {
  const fromEnv = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (isValidHttpUrl(fromEnv)) return fromEnv;
  return FISCMAK_SUPABASE_URL;
}

/** Prefer legacy anon JWT for auth cookie flows; fall back to publishable key. */
export function getSupabaseAnonKey() {
  const fromEnv = cleanEnv(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (fromEnv) return fromEnv;
  return FISCMAK_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return isValidHttpUrl(url) && Boolean(key);
}
