import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";
import { listProgramTraineeIds } from "@/lib/v2/gme/trainee-gme-data";
import { buildCohortWellbeingAggregate } from "@/lib/v2/gme/cohort-wellbeing-aggregate";

/**
 * De-identified well-being aggregate for program staff.
 * Returns only aggregate prevalence counts — never individual trainee values.
 * N<5 cohorts are suppressed per the same rule as the milestone equity guardrail.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ programId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) {
    return jsonError("not_found", "Program not found.", 404);
  }

  const allowed = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  if (!allowed) {
    return jsonError("forbidden", "Program staff access required.", 403);
  }

  try {
    const traineeIds = await listProgramTraineeIds(programId);
    const aggregate = await buildCohortWellbeingAggregate(traineeIds, auth.demo);
    return jsonOk({ aggregate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load well-being aggregate.";
    return jsonError("db_error", message, 500);
  }
}
