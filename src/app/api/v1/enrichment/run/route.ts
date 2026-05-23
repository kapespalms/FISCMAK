import { fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  mergeEnrichmentIntoMetadata,
  runApiEnrichment,
} from "@/lib/v2/api-enrichment";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const body = await request.json().catch(() => ({}));
  const trigger = (body.trigger as "manual" | "quarterly" | "cv_upload") ?? "manual";

  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV" && d.extracted_text);
  if (!cv?.extracted_text) {
    return jsonOk(
      { error: "validation_error", message: "Upload a CV before running enrichment." },
      400,
    );
  }

  const meta = getOnboardingMetadata(user);
  const snapshot = await runApiEnrichment({
    user,
    cvText: cv.extracted_text,
    trigger,
    previousSnapshot: meta.enrichment_snapshot ?? null,
  });

  const updatedMeta = mergeEnrichmentIntoMetadata(meta, snapshot);
  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk({
    run_id: snapshot.run_id,
    status: snapshot.status,
    sources: snapshot.sources,
    enrichment_snapshot: snapshot,
    pending_reconciliation: snapshot.reconciliation_items.length,
  });
}
