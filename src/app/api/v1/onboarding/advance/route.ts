import { fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  buildReconciliationCandidates,
  apiEnrichmentPlan,
} from "@/lib/v2/onboarding-touchpoint1";
import { computeTouchpoint1Dashboard, getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { findCvDocument } from "@/lib/v2/onboarding-document-types";
import { reconcileComplete } from "@/lib/v2/reconcile-mak-helpers";
import type { OnboardingStep } from "@/lib/v2/onboarding-flow-types";

type AdvanceStep = "records" | "verify" | "baseline" | "exit";

const NEXT_AFTER: Partial<Record<AdvanceStep, OnboardingStep>> = {
  records: "reconcile",
  verify: "instruments",
};

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = (await request.json()) as { step?: AdvanceStep };
  const step = body.step;
  if (!step || !["records", "verify", "baseline", "exit"].includes(step)) {
    return jsonOk({ error: "validation_error", message: "Invalid step." }, 400);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  if (step === "exit") {
    if (!user.tier1_complete) {
      return jsonOk(
        { error: "validation_error", message: "Complete your profile before leaving setup." },
        400,
      );
    }
    return jsonOk({ redirect: "/app/dashboard", next_step: null });
  }

  let meta = getOnboardingMetadata(user);
  const now = new Date().toISOString();
  let tier2_complete = user.tier2_complete;
  let tier3_complete = user.tier3_complete;

  if (step === "records") {
    meta = { ...meta, documents_skipped_at: meta.documents_skipped_at ?? now };
    tier2_complete = true;
  }

  if (step === "verify") {
    const docs = await fetchDocuments(auth.userId, auth.demo);
    const cv = findCvDocument(docs);
    const plan = apiEnrichmentPlan(user.practice_setting, user.career_stage);
    const built = buildReconciliationCandidates({
      cvText: cv?.extracted_text,
      specialty: user.specialty,
      enrichmentPlan: plan,
    });
    meta = {
      ...meta,
      reconciliation_skipped_at: now,
      reconciliation: built.map((item) => ({ id: item.id, status: "rejected" as const })),
      npi_verification_deferred: true,
    };
    tier2_complete = reconcileComplete(meta) || true;
  }

  if (step === "baseline") {
    const docs = await fetchDocuments(auth.userId, auth.demo);
    const cv = docs.find((d) => d.document_type === "CV");
    meta = {
      ...meta,
      ...computeTouchpoint1Dashboard(user, cv?.extracted_text),
      instruments_deferred_at: now,
    };
    tier3_complete = true;
  }

  const saved = await upsertAppUser(
    auth.userId,
    auth.email,
    {
      tier2_complete,
      tier3_complete,
      onboarding_metadata: meta as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk({
    tier2_complete: saved.tier2_complete,
    tier3_complete: saved.tier3_complete,
    next_step: step === "baseline" ? null : NEXT_AFTER[step] ?? null,
    redirect: saved.tier3_complete && step === "baseline" ? "/app/dashboard?welcome=1" : undefined,
  });
}
