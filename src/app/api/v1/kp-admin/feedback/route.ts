import { isErrorResponse, jsonOk } from "@/lib/v2/api-helpers";
import { fetchGlobalMakFeedbackAnalytics } from "@/lib/v2/chat-feedback-admin";
import { requireKpAdminApiUser } from "@/lib/v2/kp-admin";

/** KP Admin — platform-wide Mak thumbs up/down analytics. */
export async function GET() {
  const auth = await requireKpAdminApiUser();
  if (isErrorResponse(auth)) return auth;

  const analytics = await fetchGlobalMakFeedbackAnalytics();
  return jsonOk({ analytics });
}
