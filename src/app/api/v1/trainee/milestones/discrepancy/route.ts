import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { buildDiscrepancyFromEvaluations } from "@/lib/v2/gme/milestone-discrepancy";
import {
  loadRotationEvaluations,
  loadSelfRatings,
  resolveTraineeProgramId,
} from "@/lib/v2/gme/trainee-gme-data";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ period, rows: [], summary: { discuss: 0, watch: 0, growth_areas: 0 } });
  }

  const profile = normalizeSpecialtyProfile(user);
  const framework = resolveTraineeEvaluationFramework({
    career_stage: user.career_stage,
    base_specialty: profile.base_specialty,
    subspecialty: profile.subspecialty,
    subspecialty_training_complete: profile.subspecialty_training_complete,
  });

  if (!framework?.subcompetencies.length) {
    return jsonOk({ period, rows: [], summary: { discuss: 0, watch: 0, growth_areas: 0 } });
  }

  try {
    const selfRatings = await loadSelfRatings(auth.userId, auth.demo, period);
    const programId = resolveTraineeProgramId(user);
    const evaluations = programId
      ? await loadRotationEvaluations(auth.userId, programId)
      : [];

    const rows = buildDiscrepancyFromEvaluations({
      subcompetencies: framework.subcompetencies,
      selfRatings,
      evaluations,
    });

    const summary = {
      discuss: rows.filter((r) => r.flag === "discuss").length,
      watch: rows.filter((r) => r.flag === "watch").length,
      growth_areas: rows.filter((r) => r.growth_area).length,
    };

    return jsonOk({ period, rows, summary, eval_count: evaluations.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not compute discrepancy.";
    return jsonError("db_error", message, 500);
  }
}
