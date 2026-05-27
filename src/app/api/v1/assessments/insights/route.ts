import { fetchAssessments, fetchDocuments } from "@/lib/v2/db";
import { buildAssessmentInsights } from "@/lib/v2/assessment-insights";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { sanitizeAssessmentInsightsForUser } from "@/lib/v2/user-facing-analytics";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    user = await upsertAppUser(auth.userId, auth.email, {}, auth.demo);
  }

  const assessments = await fetchAssessments(auth.userId, auth.demo);
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const insights = buildAssessmentInsights({ user, assessments, documents });

  return jsonOk(sanitizeAssessmentInsightsForUser(insights));
}
