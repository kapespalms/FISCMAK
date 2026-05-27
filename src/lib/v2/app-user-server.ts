import { createClient } from "@/lib/supabase/server";
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

/** Server-only app user lookup (avoid importing api-helpers in Server Components). */
export async function getAppUserServer(userId: string, demo: boolean): Promise<AppUser | null> {
  if (demo) {
    return withSpecialtyDefaults(getServerDemo(userId).user);
  }
  const supabase = await createClient();
  const { data } = await supabase.from("app_users").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  return withSpecialtyDefaults(data as AppUser);
}
