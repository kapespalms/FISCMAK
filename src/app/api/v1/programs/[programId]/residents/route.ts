import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";
import { createClient } from "@/lib/supabase/server";
import { listProgramTraineeIds } from "@/lib/v2/gme/trainee-gme-data";

export async function GET(
  _request: Request,
  context: { params: Promise<{ programId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) return jsonError("not_found", "Program not found.", 404);

  const allowed = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  if (!allowed) return jsonError("forbidden", "Program staff access required.", 403);

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({ residents: [], demo: true });
  }

  const supabase = await createClient();
  const traineeIds = await listProgramTraineeIds(programId);

  if (!traineeIds.length) return jsonOk({ residents: [] });

  const [{ data: users }, { data: evals }, { data: goals }] = await Promise.all([
    supabase
      .from("app_users")
      .select("user_id, name, pgy_level, onboarding_metadata")
      .in("user_id", traineeIds),
    supabase
      .from("rotation_evaluations")
      .select("trainee_user_id")
      .eq("program_id", programId)
      .in("trainee_user_id", traineeIds),
    supabase
      .from("ilp_goals")
      .select("user_id, status")
      .in("user_id", traineeIds)
      .eq("reporting_period", "current"),
  ]);

  const evalCounts = new Map<string, number>();
  for (const row of evals ?? []) {
    if (row.trainee_user_id) {
      evalCounts.set(row.trainee_user_id, (evalCounts.get(row.trainee_user_id) ?? 0) + 1);
    }
  }

  const ilpCounts = new Map<string, { active: number; draft: number }>();
  for (const row of goals ?? []) {
    if (!row.user_id) continue;
    const curr = ilpCounts.get(row.user_id) ?? { active: 0, draft: 0 };
    if (row.status === "active") curr.active++;
    else if (row.status === "draft") curr.draft++;
    ilpCounts.set(row.user_id, curr);
  }

  const residents = (users ?? []).map((user) => {
    const meta = user.onboarding_metadata as { trainee_initials?: string } | null;
    const evalCount = evalCounts.get(user.user_id) ?? 0;
    const ilp = ilpCounts.get(user.user_id) ?? { active: 0, draft: 0 };
    return {
      user_id: user.user_id,
      name: user.name ?? null,
      initials: meta?.trainee_initials ?? null,
      pgy_level: user.pgy_level ?? null,
      eval_count: evalCount,
      milestones_rated: evalCount > 0,
      pre_ccc_ready: evalCount >= 2,
      ilp_active_count: ilp.active,
      ilp_draft_count: ilp.draft,
      duty_hours_flag: null,
    };
  });

  residents.sort((a, b) => {
    const na = parseInt(a.pgy_level?.replace(/\D/g, "") ?? "0") || 0;
    const nb = parseInt(b.pgy_level?.replace(/\D/g, "") ?? "0") || 0;
    return na - nb;
  });

  return jsonOk({ residents });
}
