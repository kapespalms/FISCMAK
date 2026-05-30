import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { quarterlyPulseStatus, type PulseAnswer } from "@/lib/v2/quarterly-pulse";
import { submitQuarterlyPulse } from "@/lib/v2/touchpoint-submit";
import {
  buildQuarterlyCheckinSummaryBullets,
  formatSummaryConfirmPrompt,
} from "@/lib/v2/checkin-summary-confirm";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const status = quarterlyPulseStatus(meta);

  return jsonOk(status);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const { answers, summary_confirmed } = body as {
    answers?: PulseAnswer[];
    summary_confirmed?: boolean;
  };
  if (!answers?.length) {
    return jsonOk({ error: "validation_error", message: "Pulse answers required." }, 400);
  }

  const meta = getOnboardingMetadata(user);
  const bullets = buildQuarterlyCheckinSummaryBullets(user, answers);

  if (!summary_confirmed) {
    return jsonOk({
      requires_confirm: true,
      bullets,
      confirm_prompt: formatSummaryConfirmPrompt(bullets),
    });
  }

  const result = await submitQuarterlyPulse({
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
    quarter: result.quarter,
    summary: result.summary,
    triggers: result.triggers,
    completed_at: result.completed_at,
    enrichment: result.meta.enrichment_snapshot
      ? {
          run_id: result.meta.enrichment_snapshot.run_id,
          status: result.meta.enrichment_snapshot.status,
          changes: result.meta.enrichment_snapshot.changes_summary,
        }
      : null,
    stalled_goal: result.meta.stalled_goal_title
      ? {
          title: result.meta.stalled_goal_title,
          quarters: result.meta.stalled_goal_quarters,
        }
      : null,
  });
}
