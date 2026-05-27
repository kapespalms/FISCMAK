import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { patchIlpGoal } from "@/lib/v2/gme/trainee-gme-data";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ goalId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { goalId } = await context.params;

  let body: {
    goal_text?: string;
    resources?: string | null;
    target_date?: string | null;
    status?: string;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  if (body.status && !["draft", "active", "completed", "deferred"].includes(body.status)) {
    return jsonError("bad_request", "Invalid status.", 400);
  }

  try {
    const goal = await patchIlpGoal(auth.userId, auth.email, auth.demo, goalId, body);
    if (!goal) {
      return jsonError("not_found", "ILP goal not found.", 404);
    }
    return jsonOk({ goal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update ILP goal.";
    return jsonError("db_error", message, 500);
  }
}
