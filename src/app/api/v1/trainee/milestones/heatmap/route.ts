import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
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
  resolveTraineeProgramId,
} from "@/lib/v2/gme/trainee-gme-data";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";
  const medhubOnly = searchParams.get("medhub_only") === "true";

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ period, cells: [], subcompetencies: [] });
  }

  const profile = normalizeSpecialtyProfile(user);
  const subcompetencies = getSpecialtySubcompetencies("psychiatry").filter(
    (s) => !medhubOnly || s.medhub_outpatient_form,
  );

  const expected = expectedMilestoneLevelForPgy(user.pgy_level);
  const selfRatings = await loadSelfRatings(auth.userId, auth.demo, period);
  const selfMap = new Map(
    selfRatings
      .filter((r) => r.self_level != null)
      .map((r) => [r.subcompetency_id, r.self_level as number]),
  );

  const programId = resolveTraineeProgramId(user);
  const evaluations = programId
    ? await loadRotationEvaluations(auth.userId, programId)
    : [];
  const externalMap = aggregateExternalRatings(evaluations);

  let priteScores: { exam_year: number; overall_percentile: number | null } | null = null;
  if (isSupabaseConfigured() && !auth.demo && programId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("in_training_exams")
      .select("exam_year, overall_percentile")
      .eq("trainee_user_id", auth.userId)
      .eq("exam_type", "PRITE")
      .order("exam_year", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) priteScores = data;
  }

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
    pgy_level: user.pgy_level,
    base_specialty: profile.base_specialty,
    eval_count: evaluations.length,
    prite: priteScores,
    cells,
  });
}
