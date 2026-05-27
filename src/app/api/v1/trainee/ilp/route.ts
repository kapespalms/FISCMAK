import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { loadIlpGoals } from "@/lib/v2/gme/trainee-gme-data";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  try {
    const goals = await loadIlpGoals(auth.userId, auth.demo, period);
    return jsonOk({ period, goals });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load ILP goals.";
    return jsonError("db_error", message, 500);
  }
}
