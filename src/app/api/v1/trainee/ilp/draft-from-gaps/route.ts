import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  draftIlpGoalsFromDiscrepancy,
  buildDiscrepancyFromEvaluations,
} from "@/lib/v2/gme/milestone-discrepancy";
import {
  insertIlpGoals,
  loadIlpGoals,
  loadRotationEvaluations,
  loadSelfRatings,
  resolveTraineeProgramId,
} from "@/lib/v2/gme/trainee-gme-data";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let body: { period?: string; replace_drafts?: boolean };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const period = body.period ?? "current";
  const replaceDrafts = body.replace_drafts ?? true;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonError("not_found", "User profile not found.", 404);
  }

  const profile = normalizeSpecialtyProfile(user);
  const framework = resolveTraineeEvaluationFramework({
    career_stage: user.career_stage,
    base_specialty: profile.base_specialty,
    subspecialty: profile.subspecialty,
    subspecialty_training_complete: profile.subspecialty_training_complete,
  });

  if (!framework?.subcompetencies.length) {
    return jsonError("not_applicable", "No milestone framework for this trainee.", 400);
  }

  try {
    const selfRatings = await loadSelfRatings(auth.userId, auth.demo, period);
    const programId = resolveTraineeProgramId(user);
    const evaluations = programId
      ? await loadRotationEvaluations(auth.userId, programId)
      : [];

    const discrepancy = buildDiscrepancyFromEvaluations({
      subcompetencies: framework.subcompetencies,
      selfRatings,
      evaluations,
    });

    const drafts = draftIlpGoalsFromDiscrepancy(discrepancy);
    if (!drafts.length) {
      return jsonOk({
        period,
        goals: await loadIlpGoals(auth.userId, auth.demo, period),
        drafted: 0,
        note: "No growth areas detected — complete self-ratings and import MedHub evals first.",
      });
    }

    const goals = await insertIlpGoals(
      auth.userId,
      auth.email,
      auth.demo,
      period,
      drafts.map((d) => ({
        subcompetency_id: d.subcompetency_id,
        goal_text: d.goal_text,
        resources: d.resources,
        status: "draft",
        source: d.source,
      })),
      replaceDrafts,
    );

    return jsonOk({ period, goals, drafted: drafts.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not draft ILP goals.";
    return jsonError("db_error", message, 500);
  }
}
