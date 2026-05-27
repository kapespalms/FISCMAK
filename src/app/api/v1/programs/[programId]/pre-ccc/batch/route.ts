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
import { buildTraineePreCccSummary } from "@/lib/v2/gme/pre-ccc-service";
import { listProgramTraineeIds } from "@/lib/v2/gme/trainee-gme-data";

export async function GET(
  request: Request,
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

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  try {
    const traineeIds = await listProgramTraineeIds(programId);
    const summaries = await Promise.all(
      traineeIds.map(async (traineeUserId) => {
        const summary = await buildTraineePreCccSummary({
          programId,
          traineeUserId,
          reportingPeriod: period,
          demo: auth.demo,
        });
        return summary;
      }),
    );

    summaries.sort((a, b) =>
      (a.trainee_initials ?? "").localeCompare(b.trainee_initials ?? ""),
    );

    return jsonOk({
      period,
      count: summaries.length,
      summaries,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not build batch pre-CCC.";
    return jsonError("db_error", message, 500);
  }
}
