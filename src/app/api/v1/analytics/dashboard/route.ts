import { buildAnalyticsDashboard } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { sanitizeAnalyticsDashboardForUser } from "@/lib/v2/user-facing-analytics";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  let user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    user = await upsertAppUser(auth.userId, auth.email, {}, auth.demo);
  }
  const dashboard = await buildAnalyticsDashboard(user, auth.demo);
  return jsonOk(sanitizeAnalyticsDashboardForUser(dashboard));
}
