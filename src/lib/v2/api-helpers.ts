import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getServerDemo } from "@/lib/v2/demo-store";
import type { AppUser } from "@/lib/v2/types";
import { migrateLegacySpecialty } from "@/lib/v2/specialty-hierarchy";

function withSpecialtyDefaults(user: AppUser): AppUser {
  if (user.base_specialty != null) {
    return {
      ...user,
      subspecialty_training_complete: Boolean(user.subspecialty_training_complete),
    };
  }
  const migrated = migrateLegacySpecialty(user.specialty);
  return {
    ...user,
    base_specialty: migrated.base_specialty,
    subspecialty: migrated.subspecialty,
    subspecialty_training_complete: migrated.subspecialty_training_complete,
    specialty: migrated.specialty ?? user.specialty,
  };
}

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(
  error: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json({ error, message, details }, { status });
}

export async function requireApiUser(): Promise<
  { userId: string; email: string; demo: boolean } | NextResponse
> {
  if (!isSupabaseConfigured()) {
    return { userId: "demo-user", email: "demo@fiscmak.app", demo: true };
  }
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return jsonError("unauthorized", "Authentication required. Please log in.", 401, {
      code: "AUTH_REQUIRED",
    });
  }
  return { userId: user.id, email: user.email ?? "", demo: false };
}

export async function getAppUser(userId: string, demo: boolean): Promise<AppUser | null> {
  if (demo) {
    return withSpecialtyDefaults(getServerDemo(userId).user);
  }
  const supabase = await createClient();
  const { data } = await supabase.from("app_users").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  return withSpecialtyDefaults(data as AppUser);
}

export async function upsertAppUser(
  userId: string,
  email: string,
  patch: Partial<AppUser>,
  demo: boolean,
): Promise<AppUser> {
  if (demo) {
    const state = getServerDemo(userId);
    state.user = withSpecialtyDefaults({
      ...state.user,
      ...patch,
      user_id: userId,
      email,
      last_active: new Date().toISOString(),
    });
    return state.user;
  }
  const supabase = await createClient();
  const row = {
    user_id: userId,
    email,
    ...patch,
    last_active: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("app_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  const { data, error } = existing
    ? await supabase.from("app_users").update(row).eq("user_id", userId).select("*").single()
    : await supabase.from("app_users").insert(row).select("*").single();

  if (error) throw error;
  return withSpecialtyDefaults(data as AppUser);
}

export async function touchLastActive(userId: string, demo: boolean) {
  if (demo) return;
  const supabase = await createClient();
  await supabase
    .from("app_users")
    .update({ last_active: new Date().toISOString() })
    .eq("user_id", userId);
}

export function isErrorResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}

/** Extract a human-readable message from Supabase/PostgREST errors (not always `Error` instances). */
export function storageErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Could not save profile to database.";
}
