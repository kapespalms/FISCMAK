import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  canAccessProgramStaffTools,
  resolveProgramId,
  verifyTraineeInProgram,
} from "@/lib/v2/gme/gme-program-access";
import { approveIlpGoalForTrainee } from "@/lib/v2/gme/trainee-gme-data";

export async function POST(
  request: Request,
  context: { params: Promise<{ programId: string; goalId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { programId: programParam, goalId } = await context.params;
  const programId = resolveProgramId(programParam);
  if (!programId) {
    return jsonError("not_found", "Program not found.", 404);
  }

  const allowed = await canAccessProgramStaffTools(auth.userId, auth.email, programId);
  if (!allowed) {
    return jsonError("forbidden", "Program staff access required.", 403);
  }

  let body: { trainee_user_id?: string; period?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  const traineeUserId = body.trainee_user_id?.trim();
  if (!traineeUserId) {
    return jsonError("bad_request", "trainee_user_id is required.", 400);
  }

  const inProgram = await verifyTraineeInProgram(traineeUserId, programId);
  if (!inProgram && !auth.demo) {
    return jsonError("not_found", "Trainee not found in this program.", 404);
  }

  try {
    const goal = await approveIlpGoalForTrainee({
      traineeUserId,
      goalId,
      approverUserId: auth.userId,
      demo: auth.demo,
      period: body.period ?? "current",
    });
    if (!goal) {
      return jsonError("not_found", "ILP goal not found.", 404);
    }
    return jsonOk({ goal, approved_by: auth.userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not approve ILP goal.";
    return jsonError("db_error", message, 500);
  }
}
