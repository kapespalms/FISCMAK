import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  annualRefreshStatus,
  buildAnnualRefreshSummary,
  parseAnnualAnswers,
  type AnnualRefreshAnswer,
} from "@/lib/v2/annual-refresh";
import { runTouchpointSideEffects } from "@/lib/v2/touchpoint-side-effects";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import { fetchDocuments } from "@/lib/v2/db";
import { updateAlignmentTracking } from "@/lib/v2/career-alignment-tracking";
import { careerAlignmentFromHealth } from "@/lib/mak-chatbot-states";
import {
  metricValuesForTracking,
  updateMetricDeclineTracking,
} from "@/lib/v2/metric-decline-tracking";
import { clearAnnualRefreshSession } from "@/lib/v2/annual-mak-flow";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  return jsonOk(annualRefreshStatus(meta));
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { answers } = body as { answers?: AnnualRefreshAnswer[] };
  if (!answers?.length) {
    return jsonOk({ error: "validation_error", message: "Annual refresh answers required." }, 400);
  }

  const meta = getOnboardingMetadata(user);
  const parsed = parseAnnualAnswers(answers);
  const year = new Date().getFullYear();
  const now = new Date().toISOString();

  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, []) : null;
  const health = buildCareerHealthView({ user, cvMetrics });

  const summary = buildAnnualRefreshSummary({
    year,
    careerObjective: parsed.career_objective,
    trackEnergy: parsed.track_energy,
    invisibleHours: parsed.invisible_hours,
    goalReviewNote: parsed.goal_review,
  });

  const updatedMeta = clearAnnualRefreshSession(
    updateMetricDeclineTracking(
      updateAlignmentTracking(
        {
          ...meta,
          career_objective: parsed.career_objective ?? meta.career_objective,
          annual_refresh_history: [
            { year, completed_at: now, summary },
            ...(meta.annual_refresh_history ?? []),
          ].slice(0, 5),
        },
        careerAlignmentFromHealth(health) ?? meta.career_alignment_pct ?? 0,
      ),
      metricValuesForTracking({
        health,
        taskAlignmentScore:
          parsed.invisible_hours != null
            ? Math.max(0, Math.round(100 - parsed.invisible_hours * 5))
            : null,
      }),
    ),
  );

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    auth.demo,
  );

  const finalMeta = await runTouchpointSideEffects({
    userId: auth.userId,
    email: auth.email,
    demo: auth.demo,
    user,
    meta: updatedMeta,
    enrichmentTrigger: "annual",
  });

  return jsonOk({
    year,
    summary,
    completed_at: now,
    enrichment: finalMeta.enrichment_snapshot
      ? {
          run_id: finalMeta.enrichment_snapshot.run_id,
          status: finalMeta.enrichment_snapshot.status,
          sources: finalMeta.enrichment_snapshot.sources,
        }
      : null,
    annual_status: annualRefreshStatus(finalMeta),
  });
}
