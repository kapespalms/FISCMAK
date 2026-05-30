import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  annualRefreshStatus,
  type AnnualRefreshAnswer,
} from "@/lib/v2/annual-refresh";
import { submitAnnualRefresh } from "@/lib/v2/touchpoint-submit";
import {
  buildAnnualCheckinSummaryBullets,
  formatSummaryConfirmPrompt,
} from "@/lib/v2/checkin-summary-confirm";

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
  const { answers, summary_confirmed } = body as {
    answers?: AnnualRefreshAnswer[];
    summary_confirmed?: boolean;
  };
  if (!answers?.length) {
    return jsonOk({ error: "validation_error", message: "Annual refresh answers required." }, 400);
  }

  const meta = getOnboardingMetadata(user);
  const bullets = buildAnnualCheckinSummaryBullets(user, answers);

  if (!summary_confirmed) {
    return jsonOk({
      requires_confirm: true,
      bullets,
      confirm_prompt: formatSummaryConfirmPrompt(bullets),
    });
  }

  const result = await submitAnnualRefresh({
    userId: auth.userId,
    email: auth.email,
    demo: auth.demo,
    user,
    meta: {
      ...meta,
      checkin_summary_confirmed_at: new Date().toISOString(),
    },
    answers,
  });

  return jsonOk({
    year: result.year,
    summary: result.summary,
    completed_at: result.completed_at,
    enrichment: result.meta.enrichment_snapshot
      ? {
          run_id: result.meta.enrichment_snapshot.run_id,
          status: result.meta.enrichment_snapshot.status,
          sources: result.meta.enrichment_snapshot.sources,
        }
      : null,
    annual_status: annualRefreshStatus(result.meta),
  });
}
