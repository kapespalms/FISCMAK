import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { buildPreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";
import { buildTraineePreCccSummary } from "@/lib/v2/gme/pre-ccc-service";
import { resolveTraineeProgramId } from "@/lib/v2/gme/trainee-gme-data";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  const user = await getAppUser(auth.userId, auth.demo);
  const programId = resolveTraineeProgramId(user);
  if (!programId) {
    return jsonError("not_found", "No program linked to this trainee account.", 404);
  }

  if (auth.demo) {
    return jsonOk({
      demo: true,
      program_id: programId,
      summary: buildPreCccSummary({
        traineeUserId: auth.userId,
        reportingPeriod: period,
        evaluations: [],
        ilpGoals: [],
      }),
    });
  }

  try {
    const summary = await buildTraineePreCccSummary({
      programId,
      traineeUserId: auth.userId,
      reportingPeriod: period,
      demo: auth.demo,
    });
    return jsonOk({ program_id: programId, summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load pre-CCC summary.";
    return jsonError("db_error", message, 500);
  }
}
