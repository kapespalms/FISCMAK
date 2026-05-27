import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";
import { getProgramById, getProgramBySlug } from "@/lib/v2/programs/registry";

/**
 * INSTITUTION BOUNDARY — program staff tools must stay on the GME data plane.
 *
 * Allowed for institution endpoints (via canAccessProgramStaffTools):
 * - rotation_evaluations, ilp_goals, in_training_exams
 * - Derived aggregates: cohort heatmaps, pre-CCC summary, narrative synthesis
 *
 * Never expose to institution endpoints:
 * - documents.extracted_text (RLS: auth.uid = user_id only)
 * - s_index, iwq, _internal_coaching (S_INDEX_TRACKING.institution_facing: false)
 * - reconciliation_items, api_enrichment_runs, mempalace_exports (user-scoped only)
 *
 * If adding career evidence to institution reporting, show reconciled counts only —
 * not raw CV text or unreconciled API discoveries.
 */
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

export async function verifyTraineeInProgram(
  traineeUserId: string,
  programId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("program_memberships")
    .select("membership_id")
    .eq("program_id", programId)
    .eq("user_id", traineeUserId)
    .eq("active", true)
    .maybeSingle();

  if (membership) return true;

  const { data: user } = await supabase
    .from("app_users")
    .select("primary_program_id")
    .eq("user_id", traineeUserId)
    .maybeSingle();

  return user?.primary_program_id === programId;
}
