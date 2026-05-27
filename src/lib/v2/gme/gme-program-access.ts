import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";
import { getProgramById, getProgramBySlug } from "@/lib/v2/programs/registry";

const STAFF_ROLES = new Set([
  "program_director",
  "program_coordinator",
  "ccc_chair",
  "dio_viewer",
]);

export function resolveProgramId(programIdOrSlug: string): string | null {
  const bySlug = getProgramBySlug(programIdOrSlug);
  if (bySlug) return bySlug.id;
  const byId = getProgramById(programIdOrSlug);
  if (byId) return byId.id;
  if (/^[0-9a-f-]{36}$/i.test(programIdOrSlug)) return programIdOrSlug;
  return null;
}

export async function canAccessProgramStaffTools(
  userId: string,
  email: string,
  programId: string,
): Promise<boolean> {
  if (isKpAdminEmail(email)) return true;
  if (!isSupabaseConfigured()) return true;

  const supabase = await createClient();
  const { data } = await supabase
    .from("program_memberships")
    .select("role")
    .eq("program_id", programId)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  return data?.role ? STAFF_ROLES.has(data.role) : false;
}
