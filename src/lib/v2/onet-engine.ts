/**
 * FISCMAK O*NET Engine — F6 / F7 / F8 vector math.
 *
 * Works entirely from the precomputed O*NET 30.3 seed constants in ./onet/.
 * No runtime database queries needed for the vector math itself; DB calls are
 * only used by computeAndStoreFingerprint() to persist per-user results.
 *
 * Attribution: O*NET 30.3 Database, U.S. DOL/ETA, May 2026. CC-BY 4.0.
 * https://www.onetcenter.org/license_db.html
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { lookupSocCode } from "@/lib/v2/specialty-soc-map";
import { SOC_VECTORS }        from "@/lib/v2/onet/soc-vectors";
import { VARIANCE_WEIGHTS }   from "@/lib/v2/onet/variance-weights";
import { DOMAIN_FINGERPRINTS, DOMAIN_LABELS } from "@/lib/v2/onet/domain-fingerprints";
import { ADJACENCY_BASKETS }  from "@/lib/v2/onet/adjacency-baskets";
import { SUBSPECIALTY_FINGERPRINTS } from "@/lib/v2/onet/subspecialty-fingerprints";

export { DOMAIN_LABELS };
export type { AdjacentOccupation } from "@/lib/v2/onet/adjacency-baskets";

// ── pure vector math ─────────────────────────────────────────────────────────

/**
 * Standard cosine similarity. Returns 0 if either vector is all-zero.
 */
export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += (a[i] ?? 0) * (b[i] ?? 0);
    na  += (a[i] ?? 0) ** 2;
    nb  += (b[i] ?? 0) ** 2;
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * Variance-weighted cosine similarity.
 * Scales each dimension by its discriminative variance across physician SOCs
 * before computing cosine. High-variance descriptors (e.g., Systems Thinking)
 * dominate over low-variance baseline ones (e.g., raw Clinical Expertise).
 * Used for F6 per the spec §2 design note.
 */
export function varWeightedCosine(a: readonly number[], b: readonly number[]): number {
  const w = VARIANCE_WEIGHTS;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const wi = w[i] ?? 0;
    dot += wi * (a[i] ?? 0) * (b[i] ?? 0);
    na  += wi * (a[i] ?? 0) ** 2;
    nb  += wi * (b[i] ?? 0) ** 2;
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0;
}

/**
 * Asymmetric directional gap: what target requires that source lacks.
 * Returns 0 (no gap) when source ≥ target on every dimension.
 * Equivalent to Dawson et al. (2021) set-difference for continuous vectors.
 * Used for F7 dirCost with O*NET vectors (replaces the skill-name proxy).
 *
 * Formula: Σ_i max(0, tgt_i − src_i) / Σ_i tgt_i
 */
export function directionalGap(src: readonly number[], tgt: readonly number[]): number {
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < tgt.length; i++) {
    const s = src[i] ?? 0;
    const t = tgt[i] ?? 0;
    numerator   += Math.max(0, t - s);
    denominator += t;
  }
  return denominator > 0 ? numerator / denominator : 0;
}

// ── SOC vector lookup ────────────────────────────────────────────────────────

/** Returns the normalized 243-dim O*NET vector for a SOC code, or null if not seeded. */
export function getSocVector(socCode: string): readonly number[] | null {
  return (SOC_VECTORS as Record<string, readonly number[]>)[socCode] ?? null;
}

/**
 * Returns the domain fingerprint vector for a given physician SOC and domain.
 * Falls back to the generic physician (29-1229.00) when the SOC isn't in the seed.
 */
export function getDomainVector(
  physSoc: string,
  domainLabel: string,
): readonly number[] | null {
  const byDomain =
    (DOMAIN_FINGERPRINTS as Record<string, Record<string, readonly number[]>>)[physSoc]
    ?? (DOMAIN_FINGERPRINTS as Record<string, Record<string, readonly number[]>>)["29-1229.00"];
  return byDomain?.[domainLabel] ?? null;
}

/** Returns all 8 domain fingerprint vectors for a physician SOC. */
export function getAllDomainVectors(physSoc: string): ReadonlyArray<readonly number[]> | null {
  const source =
    (DOMAIN_FINGERPRINTS as Record<string, Record<string, readonly number[]>>)[physSoc]
    ?? (DOMAIN_FINGERPRINTS as Record<string, Record<string, readonly number[]>>)["29-1229.00"];
  if (!source) return null;
  return DOMAIN_LABELS.map((l) => source[l]).filter((v): v is readonly number[] => !!v);
}

// ── Subspecialty fingerprint resolver ────────────────────────────────────────

/**
 * Resolves subspecialty-blended data when app_users.subspecialty is set and
 * a precomputed fingerprint exists for that subspecialty.
 *
 * Returns the blended descriptor vector, domain fingerprint map, and adjacency
 * basket from the subspecialty seed. Falls back to null on all three when:
 *   - subspecialty is null/empty string
 *   - subspecialty is not in SUBSPECIALTY_FINGERPRINTS
 *   - the stored parent_soc doesn't match the expected parent SOC
 *
 * Callers should use the parent-SOC data path when usingSubspecialty = false.
 */
function resolveSubspecialty(
  subspecialty: string | null,
  parentSoc: string,
): {
  descriptorVector:      readonly number[] | null;
  domainFingerprintsMap: Readonly<Record<string, readonly number[]>> | null;
  adjacencyBasket:       readonly { soc: string; similarity: number }[] | null;
  usingSubspecialty:     boolean;
} {
  const nullResult = {
    descriptorVector:      null,
    domainFingerprintsMap: null,
    adjacencyBasket:       null,
    usingSubspecialty:     false,
  };

  if (!subspecialty || subspecialty.trim() === "") return nullResult;

  const fp = (SUBSPECIALTY_FINGERPRINTS as Record<string, {
    parent_soc: string;
    blended_vector: readonly number[];
    domain_fingerprints: Readonly<Record<string, readonly number[]>>;
    adjacency_basket: readonly { soc: string; title: string; similarity: number }[];
  } | undefined>)[subspecialty];

  if (!fp) return nullResult;

  // Sanity-check: subspecialty's parent SOC should match the physician's SOC.
  // If not (e.g., user changed specialty without clearing subspecialty), fall back.
  if (fp.parent_soc !== parentSoc) return nullResult;

  return {
    descriptorVector:      fp.blended_vector,
    domainFingerprintsMap: fp.domain_fingerprints,
    adjacencyBasket:       fp.adjacency_basket,
    usingSubspecialty:     true,
  };
}

// ── F6 Person–Occupation Fit ─────────────────────────────────────────────────

export type F6DomainScore = {
  domain_index: number;
  domain_label: string;
  fit_score:    number;   // variance-weighted cosine, 0–1
  available:    boolean;
};

export type F6Result = {
  scores:           F6DomainScore[];
  physician_vector: readonly number[] | null;
  soc_code:         string;
  computed_at:      string;
  available:        boolean;
  /** CC-BY attribution required when displaying fit scores. */
  attribution:      string;
};

/**
 * F6 Person–Occupation Fit: cosine(V_physician, V_domain[d]) for each of 8 domains.
 *
 * V_physician = the physician's specialty SOC descriptor vector (from the seed).
 * V_domain[d] = 0.50 × V_base + 0.50 × Σ w_r × V_anchor_filtered_to_task_r.
 *
 * Reads physician specialty from app_users; falls back to onet_fingerprint if
 * a personalized vector has been stored. Uses variance-weighted cosine per §2.
 */
export async function computeF6OccupationFit(
  userId:   string,
  supabase: SupabaseClient,
): Promise<F6Result> {
  const now   = new Date().toISOString();
  const attr  = "O*NET 30.3 Database, U.S. DOL/ETA, CC-BY 4.0 — onetcenter.org/license_db.html";
  const empty = { scores: [], physician_vector: null, soc_code: "", computed_at: now, available: false, attribution: attr };

  // 1. Get specialty + subspecialty → SOC
  const { data: user } = await supabase
    .from("app_users")
    .select("specialty, subspecialty")
    .eq("user_id", userId)
    .maybeSingle();

  const specialty    = (user?.specialty    as string | null) ?? null;
  const subspecialty = (user?.subspecialty as string | null) ?? null;
  if (!specialty) return empty;
  const socCode = lookupSocCode(specialty);

  // 2. Resolve subspecialty blended data if available
  const subResult = resolveSubspecialty(subspecialty, socCode);

  // 3. Try personalized vector from onet_fingerprint first
  const { data: fp } = await supabase
    .from("onet_fingerprint")
    .select("descriptor_vector")
    .eq("user_id", userId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const storedVec = (fp?.descriptor_vector as number[] | null) ?? null;

  // Physician vector priority:
  //   1. Stored personalized vector (onet_fingerprint table)
  //   2. Subspecialty blended vector (when subspecialty is set and fingerprint exists)
  //   3. Parent SOC vector (fallback)
  const physVec: readonly number[] | null =
    storedVec ?? subResult.descriptorVector ?? getSocVector(socCode);
  if (!physVec) return { ...empty, soc_code: socCode };

  // 4. Compute variance-weighted cosine against each domain fingerprint.
  //    Use subspecialty domain fingerprints when available; otherwise parent SOC.
  const scores: F6DomainScore[] = DOMAIN_LABELS.map((label, idx) => {
    const domainVec = subResult.usingSubspecialty
      ? (subResult.domainFingerprintsMap?.[label] ?? getDomainVector(socCode, label))
      : getDomainVector(socCode, label);
    if (!domainVec) return { domain_index: idx, domain_label: label, fit_score: 0, available: false };
    const fit = parseFloat(varWeightedCosine(physVec, domainVec).toFixed(4));
    return { domain_index: idx, domain_label: label, fit_score: fit, available: true };
  });

  return { scores, physician_vector: physVec, soc_code: socCode, computed_at: now, available: true, attribution: attr };
}

// ── F8 Hobby–Profession Bridge ───────────────────────────────────────────────

/** Mapping from common hobby labels to their closest O*NET SOC codes. */
const HOBBY_SOC_MAP: Readonly<Record<string, string>> = {
  photography:            "27-4021.00",
  "music/performance":    "27-2042.00",
  writing:                "27-3043.00",
  art:                    "27-1013.00",
  "coding/programming":   "15-1252.00",
  fitness:                "29-9091.00",
  cooking:                "35-1011.00",
};

export type F8Result = {
  hobby:       string;
  soc_code:    string | null;
  bridge_score: number;   // cosine similarity 0–1
  available:   boolean;
  computed_at: string;
  attribution: string;
};

/**
 * F8 Hobby–Profession Bridge: cosine(V_hobby, V_physician_specialty).
 * High score → hobby reinforces professional identity.
 * Low score → genuine recovery / contrast activity (also valuable).
 *
 * hobbyLabel must match a key in HOBBY_SOC_MAP, or pass a raw SOC code.
 */
export function computeF8HobbyFit(
  hobbyLabelOrSoc: string,
  physSoc:         string,
): F8Result {
  const now  = new Date().toISOString();
  const attr = "O*NET 30.3 Database, U.S. DOL/ETA, CC-BY 4.0 — onetcenter.org/license_db.html";

  const hobbySoc = HOBBY_SOC_MAP[hobbyLabelOrSoc.toLowerCase()] ?? hobbyLabelOrSoc;
  const hobbyVec = getSocVector(hobbySoc);
  const physVec  = getSocVector(physSoc);

  if (!hobbyVec || !physVec) {
    return { hobby: hobbyLabelOrSoc, soc_code: hobbySoc, bridge_score: 0, available: false, computed_at: now, attribution: attr };
  }

  const bridge = parseFloat(cosineSimilarity(hobbyVec, physVec).toFixed(4));
  return { hobby: hobbyLabelOrSoc, soc_code: hobbySoc, bridge_score: bridge, available: true, computed_at: now, attribution: attr };
}

/** Async version: reads specialty from DB then calls the sync form. */
export async function computeF8HobbyBridge(
  userId:          string,
  hobbyLabelOrSoc: string,
  supabase:        SupabaseClient,
): Promise<F8Result> {
  const now  = new Date().toISOString();
  const attr = "O*NET 30.3 Database, U.S. DOL/ETA, CC-BY 4.0 — onetcenter.org/license_db.html";

  const { data: user } = await supabase
    .from("app_users")
    .select("specialty")
    .eq("user_id", userId)
    .maybeSingle();

  const specialty = (user?.specialty as string | null) ?? null;
  if (!specialty) {
    return { hobby: hobbyLabelOrSoc, soc_code: null, bridge_score: 0, available: false, computed_at: now, attribution: attr };
  }

  return computeF8HobbyFit(hobbyLabelOrSoc, lookupSocCode(specialty));
}

// ── F7 dirCost (O*NET-grounded) ───────────────────────────────────────────────

/**
 * O*NET-grounded directional cost for F7 Transfer Potential.
 * Replaces the skill-name proxy when domain vectors are available.
 *
 * Uses directionalGap() on domain fingerprint vectors, variance-weighted.
 * Returns null when seed vectors are unavailable (falls back to proxy).
 */
export function dirCostOnet(
  srcDomainIdx: number,
  tgtDomainIdx: number,
  physSoc:      string,
): number | null {
  if (srcDomainIdx === tgtDomainIdx) return 0;

  const srcLabel = DOMAIN_LABELS[srcDomainIdx];
  const tgtLabel = DOMAIN_LABELS[tgtDomainIdx];
  if (!srcLabel || !tgtLabel) return null;

  const srcVec = getDomainVector(physSoc, srcLabel);
  const tgtVec = getDomainVector(physSoc, tgtLabel);
  if (!srcVec || !tgtVec) return null;

  // Apply variance weights before computing directional gap
  const wSrc = srcVec.map((v, i) => v * (VARIANCE_WEIGHTS[i] ?? 0));
  const wTgt = tgtVec.map((v, i) => v * (VARIANCE_WEIGHTS[i] ?? 0));

  return parseFloat(directionalGap(wSrc, wTgt).toFixed(4));
}

// ── onet_fingerprint population ───────────────────────────────────────────────

export type FingerprintResult = {
  stored:             boolean;
  descriptor_vector:  readonly number[] | null;
  adjacent_soc_weights: Record<string, number>;
  soc_code:           string;
  computed_at:        string;
};

/**
 * Computes and stores the physician's O*NET fingerprint in onet_fingerprint.
 *
 * descriptor_vector = the base specialty SOC vector (243-dim, O*NET 30.3).
 * adjacent_soc_weights = top-20 non-physician Job-Zone-≥3 adjacencies.
 *
 * Recompute when specialty, FTE allocation, or RIASEC profile changes.
 */
export async function computeAndStoreFingerprint(
  userId:   string,
  supabase: SupabaseClient,
): Promise<FingerprintResult> {
  const now = new Date().toISOString();

  // Get specialty + subspecialty
  const { data: user } = await supabase
    .from("app_users")
    .select("specialty, subspecialty")
    .eq("user_id", userId)
    .maybeSingle();

  const specialty    = (user?.specialty    as string | null) ?? null;
  const subspecialty = (user?.subspecialty as string | null) ?? null;
  const socCode      = specialty ? lookupSocCode(specialty) : "29-1229.00";

  // Resolve subspecialty blended data if available
  const subResult = resolveSubspecialty(subspecialty, socCode);

  // Descriptor vector: subspecialty blended if available, else parent SOC
  const descVec = subResult.usingSubspecialty
    ? subResult.descriptorVector
    : (getSocVector(socCode) ?? getSocVector("29-1229.00"));

  // Adjacency basket: subspecialty basket if available, else parent SOC basket
  const basketSource: ReadonlyArray<{ soc: string; similarity: number }> =
    subResult.usingSubspecialty && subResult.adjacencyBasket
      ? subResult.adjacencyBasket
      : ((ADJACENCY_BASKETS as Record<string, ReadonlyArray<{ soc: string; similarity: number }>>)[socCode]
        ?? (ADJACENCY_BASKETS as Record<string, ReadonlyArray<{ soc: string; similarity: number }>>)["29-1229.00"]
        ?? []);

  const adjacentWeights: Record<string, number> = {};
  for (const entry of basketSource) adjacentWeights[entry.soc] = entry.similarity;

  if (!descVec) {
    return { stored: false, descriptor_vector: null, adjacent_soc_weights: {}, soc_code: socCode, computed_at: now };
  }

  // Upsert: delete old row then insert fresh (keeps index clean)
  await supabase.from("onet_fingerprint").delete().eq("user_id", userId);
  const { error } = await supabase.from("onet_fingerprint").insert({
    user_id:              userId,
    descriptor_vector:    Array.from(descVec),
    adjacent_soc_weights: adjacentWeights,
    computed_at:          now,
  });

  return {
    stored:              !error,
    descriptor_vector:   descVec,
    adjacent_soc_weights: adjacentWeights,
    soc_code:            socCode,
    computed_at:         now,
  };
}

/** Returns the known hobby→SOC mapping for UI display. */
export function getHobbySocMap(): Readonly<Record<string, string>> {
  return HOBBY_SOC_MAP;
}
