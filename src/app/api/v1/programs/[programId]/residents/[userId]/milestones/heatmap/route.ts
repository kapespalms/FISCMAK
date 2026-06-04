import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
  verifyTraineeInProgram,
} from "@/lib/v2/gme/gme-program-access";
import { createClient } from "@/lib/supabase/server";
import { getSpecialtySubcompetencies } from "@/lib/v2/gme/acgme-specialty-registry";
import {
  expectedMilestoneLevelForPgy,
  heatmapCellFlag,
  HEATMAP_CELL_STYLES,
} from "@/lib/v2/gme/pgy-milestone-benchmarks";
import { aggregateExternalRatings } from "@/lib/v2/gme/medhub-milestone-map";
import {
  loadRotationEvaluations,
  loadSelfRatings,
} from "@/lib/v2/gme/trainee-gme-data";

export async function GET(
  request: Request,
  context: { params: Promise<{ programId: string; userId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam, userId } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) return jsonError("not_found", "Program not found.", 404);

  const staff = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  if (!staff) return jsonError("forbidden", "Program staff access required.", 403);

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";
  const medhubOnly = searchParams.get("medhub_only") !== "false";

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      period,
      pgy_level: null,
      eval_count: 0,
      prite: null,
      cells: [],
      demo: true,
    });
  }

  const inProgram = await verifyTraineeInProgram(userId, programId);
  if (!inProgram) return jsonError("not_found", "Trainee not found in this program.", 404);

  const supabase = await createClient();
  const { data: user } = await supabase
    .from("app_users")
    .select("pgy_level")
    .eq("user_id", userId)
    .maybeSingle();

  const pgyLevel = user?.pgy_level ?? null;
  const expected = expectedMilestoneLevelForPgy(pgyLevel);

  const allSubs = getSpecialtySubcompetencies("psychiatry");
  const subcompetencies = medhubOnly ? allSubs.filter((s) => s.medhub_outpatient_form) : allSubs;

  const [selfRatings, evaluations] = await Promise.all([
    loadSelfRatings(userId, false, period),
    loadRotationEvaluations(userId, programId),
  ]);

  const selfMap = new Map(
    selfRatings
      .filter((r) => r.self_level != null)
      .map((r) => [r.subcompetency_id, r.self_level as number]),
  );
  const externalMap = aggregateExternalRatings(evaluations);

  const { data: priteRow } = await supabase
    .from("in_training_exams")
    .select("exam_year, overall_percentile")
    .eq("trainee_user_id", userId)
    .eq("exam_type", "PRITE")
    .order("exam_year", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cells = subcompetencies.map((sub) => {
    const external = externalMap.get(sub.id) ?? null;
    const self = selfMap.get(sub.id) ?? null;
    const level = external ?? self;
    const flag = heatmapCellFlag(level, expected);
    return {
      subcompetency_id: sub.id,
      number: sub.number,
      name: sub.name,
      external_level: external,
      self_level: self,
      expected_level: expected,
      flag,
      style: HEATMAP_CELL_STYLES[flag],
    };
  });

  return jsonOk({
    period,
    pgy_level: pgyLevel,
    eval_count: evaluations.length,
    prite: priteRow ?? null,
    cells,
  });
}
