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
import { loadIlpGoals } from "@/lib/v2/gme/trainee-gme-data";

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
    return jsonError("forbidden", "Not authorized for this trainee ILP.", 403);
  }

  if (!self) {
    const inProgram = await verifyTraineeInProgram(userId, programId);
    if (!inProgram && !auth.demo) {
      return jsonError("not_found", "Trainee not found in this program.", 404);
    }
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  try {
    const goals = await loadIlpGoals(userId, auth.demo, period);
    return jsonOk({ period, goals });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load ILP goals.";
    return jsonError("db_error", message, 500);
  }
}
