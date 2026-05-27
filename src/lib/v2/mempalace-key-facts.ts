/** Strip internal CV-regex metrics before MemPalace / external sync. */
export function sanitizeMemPalaceKeyFacts(
  facts: Record<string, unknown>,
): Record<string, unknown> {
  const {
    s_index: _s,
    iwq: _i,
    bits_score: _b,
    promotion_aligned_pct: _p,
    domain_scores: _d,
    invisible_work_signals: _w,
    interpretation: _interp,
    ...rest
  } = facts;

  const internal = facts._internal_coaching as Record<string, unknown> | undefined;
  if (internal) {
    const { s_index: _is, iwq: _ii, ...bands } = internal;
    return { ...rest, _internal_coaching: bands };
  }

  return rest;
}

const INTERNAL_CV_METADATA_KEYS = [
  "s_index",
  "iwq",
  "bits_score",
  "promotion_aligned_pct",
  "domain_scores",
  "invisible_work_signals",
] as const;

/** User-facing document list — hide internal CV-regex scores. */
export function sanitizeDocumentMetadataForUser(
  metadata: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!metadata) return {};
  const out = { ...metadata };
  for (const key of INTERNAL_CV_METADATA_KEYS) {
    delete out[key];
  }
  if (out._internal_coaching && typeof out._internal_coaching === "object") {
    const ic = { ...(out._internal_coaching as Record<string, unknown>) };
    delete ic.s_index;
    delete ic.iwq;
    out._internal_coaching = ic;
  }
  return out;
}
