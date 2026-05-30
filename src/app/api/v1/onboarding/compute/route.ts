import { fetchDocuments, fetchLatestMemPalace } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { computeTouchpoint1Dashboard, careerHealthMakSummary, getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import { instrumentProgress } from "@/lib/v2/onboarding-instruments";
import { tier3CompleteGate } from "@/lib/v2/checkin-summary-confirm";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { onboardingProgressPatch } from "@/lib/v2/onboarding-progress";

export async function POST() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const computed = computeTouchpoint1Dashboard(user, cv?.extracted_text);
  const meta = getOnboardingMetadata(user);

  const onboarding_metadata = {
    ...meta,
    ...computed,
    instrument_ids:
      meta.instrument_ids ??
      deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id),
  };

  // Gate tier3 completion — require all instrument clusters answered AND
  // reconciliation resolved (no items still "pending") if a CV was uploaded.
  const instrumentIds = onboarding_metadata.instrument_ids ?? [];
  const answers = meta.instrument_answers ?? [];
  const progress = instrumentProgress(instrumentIds, answers);
  const instrumentsComplete = progress.total === 0 || progress.answered >= progress.total;

  const reconciliationItems = meta.reconciliation ?? [];
  const reconcileComplete = cv
    ? reconciliationItems.length === 0 ||
      reconciliationItems.every((r) => r.status !== "pending")
    : true;

  const tier3Complete = tier3CompleteGate({
    instrumentsComplete,
    reconcileComplete,
    meta: onboarding_metadata as OnboardingMetadata,
  });

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      tier3_complete: tier3Complete,
      ...onboardingProgressPatch({ tier3_complete: tier3Complete }),
      onboarding_metadata: onboarding_metadata as Record<string, unknown>,
    },
    auth.demo,
  );

  const summary = careerHealthMakSummary(user, cv?.extracted_text);

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    state.mempalace = {
      export_id: crypto.randomUUID(),
      user_id: auth.userId,
      coaching_summary: summary,
      key_facts: {
        cdi: computed.cdi,
        ...(computed._internal_coaching
          ? {
              service_footprint_band: computed._internal_coaching.service_footprint_band,
              workload_recognition_gap: computed._internal_coaching.workload_recognition_gap,
            }
          : {}),
        practice_setting: user.practice_setting,
        primary_career_track: user.primary_career_track,
      },
      preferences: {},
      career_evolution: {},
      created_at: new Date().toISOString(),
    };
  } else {
    const existing = await fetchLatestMemPalace(auth.userId, auth.demo);
    const supabase = await createClient();
    await supabase.from("mempalace_exports").insert({
      export_id: crypto.randomUUID(),
      user_id: auth.userId,
      coaching_summary: summary,
      key_facts: {
        ...(existing?.key_facts ?? {}),
        cdi: computed.cdi,
        ...(computed._internal_coaching
          ? {
              service_footprint_band: computed._internal_coaching.service_footprint_band,
              workload_recognition_gap: computed._internal_coaching.workload_recognition_gap,
            }
          : {}),
      },
      preferences: existing?.preferences ?? {},
      career_evolution: existing?.career_evolution ?? {},
    });
  }

  return jsonOk({
    tier3_complete: tier3Complete,
    instrument_scores: computed.instrument_scores,
    instruments_progress: { answered: progress.answered, total: progress.total },
    reconcile_pending: !reconcileComplete,
    redirect: tier3Complete ? "/app/dashboard?welcome=1" : undefined,
  });
}
