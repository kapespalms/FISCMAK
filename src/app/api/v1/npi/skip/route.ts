import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { NPI_RECONCILE_IDS } from "@/lib/v2/npi-registry";

export async function POST() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonError("not_found", "User not found", 404);

  const meta = getOnboardingMetadata(user);
  const snapshot = meta.enrichment_snapshot;
  const reconciliation = [...(meta.reconciliation ?? [])];

  for (const id of NPI_RECONCILE_IDS) {
    const index = reconciliation.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      reconciliation[index] = { id, status: "rejected" };
    } else {
      reconciliation.push({ id, status: "rejected" });
    }
  }

  const updatedReconciliationItems =
    snapshot?.reconciliation_items?.map((item) =>
      NPI_RECONCILE_IDS.includes(item.id as (typeof NPI_RECONCILE_IDS)[number])
        ? {
            ...item,
            detail: "Skipped for now — add your NPI anytime in Profile.",
            status: "rejected" as const,
          }
        : item,
    ) ?? [];

  const updatedMeta = {
    ...meta,
    npi_verification_deferred: true,
    reconciliation,
    enrichment_snapshot: snapshot
      ? {
          ...snapshot,
          reconciliation_items: updatedReconciliationItems.length
            ? updatedReconciliationItems
            : snapshot.reconciliation_items,
        }
      : snapshot,
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk({ deferred: true });
}
