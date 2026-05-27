import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
} from "@/lib/v2/gme/gme-program-access";
import { buildPreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";
import { buildTraineePreCccSummary } from "@/lib/v2/gme/pre-ccc-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ programId: string; userId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam, userId } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) {
    return jsonError("not_found", "Program not found.", 404);
  }

  const staff = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  const self = auth.userId === userId;
  if (!staff && !self) {
    return jsonError("forbidden", "Not authorized for this trainee summary.", 403);
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  if (!isSupabaseConfigured() || auth.demo) {
    return jsonOk({
      demo: true,
      summary: buildPreCccSummary({
        traineeUserId: userId,
        reportingPeriod: period,
        evaluations: [],
        ilpGoals: [],
      }),
    });
  }

  try {
    const summary = await buildTraineePreCccSummary({
      programId,
      traineeUserId: userId,
      reportingPeriod: period,
      demo: auth.demo,
    });
    return jsonOk({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load pre-CCC summary.";
    return jsonError("db_error", message, 500);
  }
}
