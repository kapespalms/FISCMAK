import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  isValidNpiFormat,
  isNpiReconcileId,
  namesLikelyMatch,
  normalizeNpiInput,
  verifyNpiWithRegistry,
  NPI_RECONCILE_IDS,
} from "@/lib/v2/npi-registry";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json().catch(() => ({}));
  const npi = typeof body.npi === "string" ? normalizeNpiInput(body.npi) : "";
  const reconciliationItemId =
    typeof body.reconciliation_item_id === "string" ? body.reconciliation_item_id : "enrichment-npi";

  if (!isValidNpiFormat(npi)) {
    return jsonError("validation_error", "Enter a valid 10-digit NPI number.", 400);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonError("not_found", "User not found", 404);

  const registry = await verifyNpiWithRegistry(npi);
  const meta = getOnboardingMetadata(user);
  const snapshot = meta.enrichment_snapshot;

  const detail = registry.providerName
    ? `Registry match: ${registry.providerName}${registry.credential ? `, ${registry.credential}` : ""}${registry.organization ? ` — ${registry.organization}` : ""}.`
    : "NPI confirmed in NPPES registry.";

  const updatedReconciliationItems =
    snapshot?.reconciliation_items?.map((item) =>
      isNpiReconcileId(item.id) || item.id === reconciliationItemId
        ? {
            ...item,
            label: registry.verified ? `NPI ${registry.npi} verified` : "NPI registry lookup",
            detail: registry.verified ? detail : "No match found in NPPES registry.",
            status: registry.verified ? ("confirmed" as const) : ("rejected" as const),
          }
        : item,
    ) ?? [];

  const reconciliation = [...(meta.reconciliation ?? [])];
  for (const id of [...new Set([reconciliationItemId, ...NPI_RECONCILE_IDS])]) {
    const status = registry.verified ? "confirmed" : "rejected";
    const index = reconciliation.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      reconciliation[index] = { id, status };
    } else if (registry.verified) {
      reconciliation.push({ id, status });
    }
  }

  const updatedMeta = {
    ...meta,
    npi_verification_deferred: false,
    enrichment_snapshot: snapshot
      ? {
          ...snapshot,
          npi: registry.npi,
          npi_verified: registry.verified,
          npi_provider_name: registry.providerName ?? null,
          npi_credential: registry.credential ?? null,
          npi_organization: registry.organization ?? null,
          reconciliation_items: updatedReconciliationItems.length
            ? updatedReconciliationItems
            : snapshot.reconciliation_items,
        }
      : snapshot,
    reconciliation,
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: updatedMeta as Record<string, unknown>,
    },
    auth.demo,
  );

  const nameMatch =
    registry.verified && registry.providerName
      ? namesLikelyMatch(user.name ?? user.email?.split("@")[0] ?? "", registry.providerName)
      : false;

  if (!registry.verified) {
    return jsonOk({
      verified: false,
      npi: registry.npi,
      message: "No provider found for this NPI in the CMS NPPES registry.",
      registry_url: `https://npiregistry.cms.hhs.gov/search?number=${registry.npi}`,
    });
  }

  return jsonOk({
    verified: true,
    npi: registry.npi,
    provider_name: registry.providerName,
    credential: registry.credential,
    organization: registry.organization,
    name_match: nameMatch,
    message: registry.providerName
      ? nameMatch
        ? `Verified in NPPES: ${registry.providerName}${registry.credential ? ` (${registry.credential})` : ""}. Name matches your profile.`
        : `Verified in NPPES: ${registry.providerName}${registry.credential ? ` (${registry.credential})` : ""}. Review that this matches your profile.`
      : "NPI verified in the NPPES registry.",
    registry_url: `https://npiregistry.cms.hhs.gov/provider-view/${registry.npi}`,
  });
}
