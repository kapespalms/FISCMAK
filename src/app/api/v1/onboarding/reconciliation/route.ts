import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { findCvDocument } from "@/lib/v2/onboarding-document-types";
import {
  apiEnrichmentPlan,
  buildReconciliationCandidates,
  type ReconciliationItem,
} from "@/lib/v2/onboarding-touchpoint1";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { reconcileComplete } from "@/lib/v2/reconcile-mak-helpers";
import { persistReconciliationStatuses } from "@/lib/v2/career-data-repo";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = findCvDocument(docs);
  const plan = apiEnrichmentPlan(user.practice_setting, user.career_stage);
  const meta = getOnboardingMetadata(user);

  const built = buildReconciliationCandidates({
    cvText: cv?.extracted_text,
    specialty: user.specialty,
    enrichmentPlan: plan,
  });
  const snapshotItems = meta.enrichment_snapshot?.reconciliation_items ?? [];
  const statusMap = new Map(
    (meta.reconciliation ?? []).map((r: { id: string; status: string }) => [r.id, r.status]),
  );
  const items =
    snapshotItems.length > 0
      ? snapshotItems.map((item) => ({
          ...item,
          status: (statusMap.get(item.id) as ReconciliationItem["status"]) ?? item.status,
        }))
      : built.map((item) => ({
          ...item,
          status: (statusMap.get(item.id) as ReconciliationItem["status"]) ?? item.status,
        }));

  return jsonOk({
    items,
    cv_uploaded: Boolean(cv),
    npi: meta.enrichment_snapshot?.npi ?? null,
    npi_verified: meta.enrichment_snapshot?.npi_verified ?? false,
    npi_verification_deferred: Boolean(meta.npi_verification_deferred),
    provider_name: meta.enrichment_snapshot?.npi_provider_name ?? null,
    credential: meta.enrichment_snapshot?.npi_credential ?? null,
    organization: meta.enrichment_snapshot?.npi_organization ?? null,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const { items } = body as { items?: { id: string; status: "confirmed" | "rejected" }[] };
  if (!items?.length) {
    return jsonOk({ error: "validation_error", message: "Reconciliation items required." }, 400);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const meta = getOnboardingMetadata(user);
  const updated = {
    ...meta,
    reconciliation: items,
  };
  const complete = reconcileComplete(updated);

  const saved = await upsertAppUser(
    auth.userId,
    auth.email,
    {
      tier2_complete: complete,
      onboarding_metadata: updated as Record<string, unknown>,
    },
    auth.demo,
  );

  if (!auth.demo) {
    await persistReconciliationStatuses(
      auth.userId,
      items.map((i) => ({
        externalId: i.id,
        status: i.status,
      })),
    );
  }

  return jsonOk({
    tier2_complete: saved.tier2_complete,
    reconciliation: items,
    next_step: complete ? "instruments" : "reconcile",
  });
}
