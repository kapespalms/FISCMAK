import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";
import { createClient } from "@/lib/supabase/server";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

const STAFF_ROLES = [
  "program_director",
  "program_coordinator",
  "ccc_chair",
  "dio_viewer",
];

const FALLBACK_PROGRAM_ID =
  getProgramBySlug("uh-psych-cmc")?.id ?? "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      is_staff: true,
      is_trainee: true,
      program_id: FALLBACK_PROGRAM_ID,
      role: "program_director",
    });
  }

  if (isKpAdminEmail(auth.email)) {
    return jsonOk({
      is_staff: true,
      is_trainee: false,
      program_id: FALLBACK_PROGRAM_ID,
      role: "program_director",
    });
  }

  const supabase = await createClient();
  const [{ data: staffData }, { data: traineeData }] = await Promise.all([
    supabase
      .from("program_memberships")
      .select("program_id, role")
      .eq("user_id", auth.userId)
      .eq("active", true)
      .in("role", STAFF_ROLES)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("program_memberships")
      .select("program_id")
      .eq("user_id", auth.userId)
      .eq("active", true)
      .eq("role", "trainee")
      .limit(1)
      .maybeSingle(),
  ]);

  let isTrainee = !!traineeData;
  if (!isTrainee) {
    const { data: userRow } = await supabase
      .from("app_users")
      .select("primary_program_id")
      .eq("user_id", auth.userId)
      .maybeSingle();
    isTrainee = !!userRow?.primary_program_id;
  }

  return jsonOk({
    is_staff: !!staffData,
    is_trainee: isTrainee,
    program_id: staffData?.program_id ?? null,
    role: staffData?.role ?? null,
  });
}
