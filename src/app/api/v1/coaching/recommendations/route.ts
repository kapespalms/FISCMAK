import { fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { buildCareerRecommendations } from "@/lib/v2/career-recommendations";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user?.tier1_complete) {
    return jsonOk({ error: "not_ready", message: "Complete onboarding first." }, 400);
  }

  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, []) : null;
  const careerHealth = buildCareerHealthView({ user, cvMetrics });
  const brief = buildCareerRecommendations({ user, careerHealth, cvMetrics });

  return jsonOk(brief);
}
