import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { confirmActivityEvidence } from "@/lib/v2/activity-confirm-service";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { id } = await context.params;
  if (!id) return jsonError("id_required", "Activity id required", 400);

  const body = await request.json().catch(() => ({}));
  if (body.confirm !== true) {
    return jsonError("confirm_required", "Send { confirm: true } to confirm this activity", 400);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonError("not_found", "User not found.", 404);

  const activity = await confirmActivityEvidence({
    userId: auth.userId,
    demo: auth.demo,
    activityId: id,
  });

  if (!activity) {
    return jsonError("not_found", "Activity not found.", 404);
  }

  return jsonOk({ activity });
}
