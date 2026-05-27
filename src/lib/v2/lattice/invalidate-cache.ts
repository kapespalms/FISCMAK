import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";

/** Drop cached lattice document evidence when vault changes */
export function invalidateLatticeDocumentCache(
  meta: OnboardingMetadata,
): OnboardingMetadata {
  if (!meta.lattice_document_cache) return meta;
  const { lattice_document_cache: _removed, ...rest } = meta;
  return rest;
}
