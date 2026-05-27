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
import { buildProgramCohortDashboard } from "@/lib/v2/gme/cohort-dashboard-service";

/** Advisor cohort milestone heatmap — focused slice of cohort dashboard. */
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
    const dashboard = await buildProgramCohortDashboard({
      programId,
      period,
      demo: auth.demo,
    });

    return jsonOk({
      period: dashboard.period,
      subcompetencies: dashboard.subcompetencies,
      trainees: dashboard.trainees,
      heatmap: dashboard.milestone_heatmap,
      summary: dashboard.summary,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load cohort heatmap.";
    return jsonError("db_error", message, 500);
  }
}
