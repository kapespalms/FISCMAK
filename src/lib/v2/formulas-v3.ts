/**
 * FISCMAK v3 formula system — Part IX.
 * F1 Evidence Density, and supporting types for future formulas (F3–F7).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Source reliability weights (Part VII)
// ---------------------------------------------------------------------------

/**
 * w_s — reliability weight per evidence source.
 * Attending weights from Part VII. Trainee weights (MedHub, CCC) added when
 * those evidence streams are wired to evidence_unit.
 *
 * Sources not yet producing evidence_unit rows (energy_ranking, FCWI,
 * weekly_pulse) are present for completeness but marked; they will be wired
 * as those streams are bridged to the evidence layer in later phases.
 */
export const SOURCE_WEIGHTS: Record<string, number> = {
  cv_document:   0.50,  // career docs — Part VII
  mak_capture:   0.55,  // Mak prompts — Part VII
  // Future sources (not yet wired to evidence_unit):
  // energy_ranking: 0.60,   // domain energy ranking
  // fcwi:           0.90,   // FCWI monthly check-in
  // weekly_pulse:   0.90,   // weekly pulse
  // medhub_hours:   0.65,   // MedHub duty hours (trainee)
  // medhub_evals:   0.40,   // MedHub evals narrative (trainee)
  // ccc_milestones: 0.70,   // CCC milestone ratings (trainee)
} as const;

const DEFAULT_SOURCE_WEIGHT = 0.50; // unrecognised source → career-docs weight

function sourceWeight(inputSource: string | null | undefined): number {
  if (!inputSource) return DEFAULT_SOURCE_WEIGHT;
  return SOURCE_WEIGHTS[inputSource] ?? DEFAULT_SOURCE_WEIGHT;
}

// ---------------------------------------------------------------------------
// F1 — Evidence Density
// ---------------------------------------------------------------------------

export type DensityCell = {
  /** Skill/task axis (0–7): indexes SKILLS array. */
  skill_index:  number;
  /** Domain identity axis (0–7): indexes DOMAINS array. */
  domain_index: number;
  quadrant: "OV" | "OI" | "SV" | "SI";
  /** D(q,d,t) = Σ w_s · weight; physician-confirmed evidence only. */
  density: number;
};

export type F1Result = {
  cells: DensityCell[];   // non-zero cells only; full grid implied zero elsewhere
  computed_at: string;
};

/**
 * F1 Evidence Density: D(q,d,t) = Σ w_s · n(s,q,d,t)
 *
 * In the multi-cell weighted model, n(s,q,d,t) = Σ weight for source s in
 * cell (q,d,t). Weight already encodes how much of each evidence_unit belongs
 * to this cell, so the formula becomes:
 *
 *   D(q,d,t) = Σ_evidence_unit  w_s(eu.source) · ecw.weight
 *
 * where the sum is over all (eu, ecw) pairs with physician_confirmed = true.
 *
 * Gracefully returns empty cells if evidence tables don't exist yet or are
 * empty (migrations not yet applied).
 */
export async function computeF1Density(
  userId: string,
  supabase: SupabaseClient,
): Promise<F1Result> {
  const now = new Date().toISOString();

  // 1. Fetch all evidence_cell_weights for this user
  const { data: cellWeights, error: ecwError } = await supabase
    .from("evidence_cell_weights")
    .select("skill_index, domain_index, recognition_quadrant, weight, evidence_unit_id")
    .eq("user_id", userId);

  if (ecwError || !cellWeights?.length) {
    return { cells: [], computed_at: now };
  }

  // 2. Fetch corresponding evidence_units (physician-confirmed only)
  const euIds = [...new Set(cellWeights.map((c) => c.evidence_unit_id as string))];
  const { data: evidenceUnits } = await supabase
    .from("evidence_unit")
    .select("id, source_activity_id, physician_confirmed")
    .in("id", euIds)
    .eq("user_id", userId)
    .eq("physician_confirmed", true);

  if (!evidenceUnits?.length) {
    return { cells: [], computed_at: now };
  }

  // Build map: evidence_unit_id → source_activity_id (nullable)
  const confirmedEuIds = new Set(evidenceUnits.map((eu) => eu.id as string));
  const euToActivity = new Map(
    evidenceUnits
      .filter((eu) => eu.source_activity_id)
      .map((eu) => [eu.id as string, eu.source_activity_id as string]),
  );

  // 3. Batch-fetch input_source from activity_entries for the source weight lookup
  const activityIds = [...euToActivity.values()];
  const activitySourceMap = new Map<string, string>();
  if (activityIds.length > 0) {
    const { data: activities } = await supabase
      .from("activity_entries")
      .select("id, input_source")
      .in("id", activityIds);
    for (const a of activities ?? []) {
      if (a.input_source) activitySourceMap.set(a.id as string, a.input_source as string);
    }
  }

  // 4. Compute D(q,d,t) = Σ w_s · weight
  const densityMap = new Map<string, number>();

  for (const ecw of cellWeights) {
    const euId = ecw.evidence_unit_id as string;
    if (!confirmedEuIds.has(euId)) continue; // skip unconfirmed

    const activityId = euToActivity.get(euId);
    const inputSource = activityId ? activitySourceMap.get(activityId) : undefined;
    const w = sourceWeight(inputSource);

    const key = `${ecw.skill_index}:${ecw.domain_index}:${ecw.recognition_quadrant}`;
    densityMap.set(key, (densityMap.get(key) ?? 0) + w * (ecw.weight as number));
  }

  const cells: DensityCell[] = Array.from(densityMap.entries())
    .map(([key, density]) => {
      const [s, d, q] = key.split(":");
      return {
        skill_index:  Number(s),
        domain_index: Number(d),
        quadrant:     q as DensityCell["quadrant"],
        density,
      };
    })
    .filter((c) => c.density > 0)
    .sort((a, b) => a.domain_index - b.domain_index || a.skill_index - b.skill_index);

  return { cells, computed_at: now };
}

// ---------------------------------------------------------------------------
// F3 — Structural Discrepancy (Part IX + Annex F.4)
// ---------------------------------------------------------------------------

/**
 * Setting-normed FTE expectations (Annex F.4 table midpoints).
 * Ranges from the spec; midpoints used as Expected_d(setting).
 * Values are 0–1 fractions (e.g. 0.40 = 40%).
 */
const FTE_NORMS: Record<string, Record<string, number>> = {
  Academic:    { clinical: 0.40, teaching: 0.20, research: 0.30, admin: 0.125 },
  Community:   { clinical: 0.90, teaching: 0.025, research: 0.025, admin: 0.10 },
  Hybrid:      { clinical: 0.60, teaching: 0.125, research: 0.10, admin: 0.175 },
  Government:  { clinical: 0.75, teaching: 0.10, research: 0.125, admin: 0.15 },
  Industry:    { clinical: 0.10, teaching: 0.025, research: 0.25, admin: 0.45 },
};

const F3_DELTA = 0.01; // smoothing factor to avoid div-by-zero on tiny expected values
const F3_FLAG_THRESHOLD = 0.20; // |Δ| > 20% → flagged as material discrepancy

export type F3RoleDiscrepancy = {
  role:     string;
  actual:   number;   // 0–1
  expected: number;   // setting-normed midpoint
  delta:    number;   // (actual − expected) / (expected + δ)
  flagged:  boolean;  // |delta| > threshold
};

export type F3Result = {
  roles:       F3RoleDiscrepancy[];
  setting:     string | null;
  computed_at: string;
  /** null when fte_actual or practice_setting not yet captured */
  available:   boolean;
};

/**
 * F3 Structural Discrepancy: Δ = (Actual − Expected(setting)) / (Expected(setting) + δ)
 * Positive Δ = doing more than setting norm; negative = doing less.
 * Returns available=false when required inputs are missing.
 */
export async function computeF3Discrepancy(
  userId: string,
  supabase: SupabaseClient,
): Promise<F3Result> {
  const now = new Date().toISOString();

  const { data: user } = await supabase
    .from("app_users")
    .select("practice_setting, fte_actual")
    .eq("user_id", userId)
    .maybeSingle();

  const setting = (user?.practice_setting as string | null) ?? null;
  const fteActual = (user?.fte_actual as Record<string, number> | null) ?? null;

  if (!setting || !fteActual || Object.keys(fteActual).length === 0) {
    return { roles: [], setting, computed_at: now, available: false };
  }

  const norms = FTE_NORMS[setting] ?? FTE_NORMS.Community!;
  const roles: F3RoleDiscrepancy[] = Object.keys(norms).map((role) => {
    const actual   = fteActual[role] ?? 0;
    const expected = norms[role]!;
    const delta    = (actual - expected) / (expected + F3_DELTA);
    return { role, actual, expected, delta, flagged: Math.abs(delta) > F3_FLAG_THRESHOLD };
  });

  return { roles, setting, computed_at: now, available: true };
}

// ---------------------------------------------------------------------------
// F4 — Perception Gap (Part IX)
// ---------------------------------------------------------------------------

export type F4RoleGap = {
  role:      string;
  perceived: number;   // what physician believes institution expects
  expected:  number;   // what physician reported as institutional allocation
  gap:       number;   // perceived − expected (positive = overestimates institutional demand)
};

export type F4Result = {
  roles:       F4RoleGap[];
  computed_at: string;
  available:   boolean;
};

/**
 * F4 Perception Gap: P_d = Perceived_d − Expected_d
 * Positive gap = physician believes institution demands more than allocated.
 * Returns available=false when either FTE field is missing.
 */
export async function computeF4PerceptionGap(
  userId: string,
  supabase: SupabaseClient,
): Promise<F4Result> {
  const now = new Date().toISOString();

  const { data: user } = await supabase
    .from("app_users")
    .select("fte_perceived, fte_expected")
    .eq("user_id", userId)
    .maybeSingle();

  const perceived = (user?.fte_perceived as Record<string, number> | null) ?? null;
  const expected  = (user?.fte_expected  as Record<string, number> | null) ?? null;

  if (!perceived || !expected || Object.keys(perceived).length === 0) {
    return { roles: [], computed_at: now, available: false };
  }

  const roles = Object.keys(expected).map((role) => ({
    role,
    perceived: perceived[role] ?? 0,
    expected:  expected[role]  ?? 0,
    gap:       (perceived[role] ?? 0) - (expected[role] ?? 0),
  }));

  return { roles, computed_at: now, available: true };
}

// ---------------------------------------------------------------------------
// F5 — Recognition Gap (Part IX — internal/coaching only, never shown as a number)
// ---------------------------------------------------------------------------

export type F5Result = {
  /** G = Σ(OI+SI) / Σ(OV+SV). G > 1.0 = predominantly unrecognized. */
  G:           number;
  oi_si_total: number;
  ov_sv_total: number;
  computed_at: string;
  available:   boolean;
  /**
   * GOVERNANCE: F5 is for internal coaching context only.
   * Never surface G as a headline number to the physician.
   * Use it to shape Mak probes and transfer-pathway suggestions.
   */
  internal_only: true;
};

/**
 * F5 Recognition Gap: G = Σ(OI+SI) / Σ(OV+SV)
 * G > 1.0 means the physician has more unrecognized than recognized evidence.
 * INTERNAL / COACHING ONLY — this value must never be shown as a raw number.
 */
export async function computeF5RecognitionGap(
  userId: string,
  supabase: SupabaseClient,
): Promise<F5Result> {
  const now = new Date().toISOString();
  const f1  = await computeF1Density(userId, supabase);

  const totals: Record<string, number> = { OV: 0, OI: 0, SV: 0, SI: 0 };
  for (const cell of f1.cells) {
    totals[cell.quadrant] = (totals[cell.quadrant] ?? 0) + cell.density;
  }

  const oi_si = (totals.OI ?? 0) + (totals.SI ?? 0);
  const ov_sv = (totals.OV ?? 0) + (totals.SV ?? 0);

  const G = ov_sv > 0 ? oi_si / ov_sv : 0;

  return {
    G,
    oi_si_total: oi_si,
    ov_sv_total: ov_sv,
    computed_at: now,
    available:   f1.cells.length > 0,
    internal_only: true,
  };
}

// ---------------------------------------------------------------------------
// F7 — Transfer Potential (Part IX + Intelligence Layer Spec §4)
// ---------------------------------------------------------------------------

// Prediger People–Things / Data–Ideas coordinates per domain identity (0–7).
// [people_things, data_ideas] — People/Ideas = +, Things/Data = −
// From FISCMAK RIASEC codes: Clinician I·S·R (center) … Wellness S·A·I (People+Ideas).
const DOMAIN_CIRCUMPLEX: ReadonlyArray<readonly [number, number]> = [
  [ 0.0,  0.0],  // 0 Clinician      (I·S·R — center)
  [ 0.7,  0.7],  // 1 Educator       (S·I·A — People+Ideas)
  [-0.3,  0.7],  // 2 Researcher     (I·A·C — Things+Ideas)
  [ 0.3, -0.7],  // 3 Admin/Leader   (E·S·C — People+Data)
  [ 0.7,  0.3],  // 4 Advocate       (S·E·A — People)
  [-0.3,  0.3],  // 5 Innovator      (I·R·E — Things+Ideas)
  [-0.7, -0.3],  // 6 Quality/Safety (C·I·S — Things+Data)
  [ 0.7,  0.7],  // 7 Wellness Champ (S·A·I — same quadrant as Educator)
];

// max circumplex distance: Quality/Safety ↔ Educator ≈ √(1.4²+1.0²) ≈ 1.72
const MAX_CIRCUMPLEX_DIST = Math.sqrt(1.4 ** 2 + 1.0 ** 2);

// Top-3 primary skills per domain identity — from domain_skill_rank_matrix.json.
// Used for DirCost (directional gap) without O*NET.
const DOMAIN_PRIMARY_SKILLS: ReadonlyArray<ReadonlyArray<string>> = [
  ["Clinical Expertise", "Medical Knowledge", "Communication"],                              // Clinician
  ["Communication", "Practice-Based Learning", "Collaboration & Teamwork"],                  // Educator
  ["Medical Knowledge", "Practice-Based Learning", "Personal & Professional Development"],   // Researcher
  ["Systems Thinking", "Collaboration & Teamwork", "Professionalism & Ethics"],             // Admin/Leader
  ["Systems Thinking", "Professionalism & Ethics", "Communication"],                        // Advocate
  ["Practice-Based Learning", "Systems Thinking", "Medical Knowledge"],                     // Innovator
  ["Practice-Based Learning", "Systems Thinking", "Clinical Expertise"],                    // Quality/Safety
  ["Personal & Professional Development", "Collaboration & Teamwork", "Professionalism & Ethics"], // WC
];

export function circlumplexProximity(srcDomain: number, tgtDomain: number): number {
  if (srcDomain === tgtDomain) return 1.0;
  const [sx, sy] = DOMAIN_CIRCUMPLEX[srcDomain] ?? [0, 0];
  const [tx, ty] = DOMAIN_CIRCUMPLEX[tgtDomain] ?? [0, 0];
  const dist = Math.sqrt((sx - tx) ** 2 + (sy - ty) ** 2);
  return Math.max(0, 1 - dist / MAX_CIRCUMPLEX_DIST);
}

// Directional gap: fraction of target's primary skills not in source's primary skills.
// Dawson et al. 2021 — asymmetric. Moving A→B ≠ B→A.
// Returns a raw cost (0 = all target skills already in source, 1 = all target skills new).
// Applied in T as × (1 − dirCost): the spec writes "× DirCost" but defines it as a gap
// (fraction lacking), so (1 − cost) converts it to the retained-fraction form. Behaviour:
// adjacent domains (small cost) → high T; opposite domains (large cost) → low T.
export function dirCost(srcDomain: number, tgtDomain: number): number {
  if (srcDomain === tgtDomain) return 0;
  const srcTop3 = new Set(DOMAIN_PRIMARY_SKILLS[srcDomain] ?? []);
  const lacking = (DOMAIN_PRIMARY_SKILLS[tgtDomain] ?? []).filter((s) => !srcTop3.has(s)).length;
  return lacking / 3;
}

export type F7TransferCell = {
  skill_index:    number;
  domain_index:   number;  // source domain identity
  quadrant:       "OV" | "OI" | "SV" | "SI";
  density:        number;
  /** Circumplex proximity to goal domain (0–1, higher = closer). */
  relevance:      number;
  /** Fraction of goal's primary skills not in source's primary skills (0–1). */
  dir_cost:       number;
  /** density × relevance × (1 − dir_cost) */
  transfer_score: number;
};

export type F7Result = {
  goal_domain_index: number;
  cells:             F7TransferCell[];
  computed_at:       string;
  available:         boolean;
};

/**
 * F7 Transfer Potential: T(q,d,t) = D(q,d,t) · Relevance(d→goal) · (1 − DirCost(d→goal))
 *
 * Ranks evidence cells by transfer potential toward the stated goal domain.
 * Relevance = RIASEC Prediger circumplex proximity (Part IX, Intelligence Layer Spec §4).
 * DirCost = directional skill gap from source to target (Dawson et al. 2021).
 * O*NET descriptor grounding for DirCost deferred to Phase 2+.
 */
export async function computeF7TransferPotential(
  userId: string,
  goalDomainIndex: number,
  supabase: SupabaseClient,
): Promise<F7Result> {
  const now = new Date().toISOString();
  const f1  = await computeF1Density(userId, supabase);

  if (!f1.cells.length) {
    return { goal_domain_index: goalDomainIndex, cells: [], computed_at: now, available: false };
  }

  const cells: F7TransferCell[] = f1.cells.map((cell) => {
    const relevance = circlumplexProximity(cell.domain_index, goalDomainIndex);
    const cost      = dirCost(cell.domain_index, goalDomainIndex);
    return {
      skill_index:    cell.skill_index,
      domain_index:   cell.domain_index,
      quadrant:       cell.quadrant,
      density:        cell.density,
      relevance,
      dir_cost:       cost,
      transfer_score: cell.density * relevance * (1 - cost),
    };
  });

  cells.sort((a, b) => b.transfer_score - a.transfer_score);

  return { goal_domain_index: goalDomainIndex, cells, computed_at: now, available: true };
}

// ---------------------------------------------------------------------------
// Seven-gap computation (Part XV) — on a stated goal domain
// ---------------------------------------------------------------------------

// Skill index used for Knowledge gap proxy (post vocabulary un-flip)
const SKILL_IDX_MEDICAL_KNOWLEDGE = 1;

export type SevenGap = {
  name:        string;
  score:       number;   // 0–1, higher = larger gap
  available:   boolean;
  description: string;
};

export type SevenGapResult = {
  goal_domain_index: number;
  gaps:              SevenGap[];
  computed_at:       string;
  available:         boolean;
};

// ---------------------------------------------------------------------------
// Credential gap signals — per-domain strengthening credential table
// (Founder table 2026-06-04; framing rule: strengthening signal, never a gate)
//
// Clinician (0) = baseline — MD/DO + board cert assumed present, never flagged.
// For all other domains: gap = fraction of domain's signals absent from the user's
// CV evidence (parsed degrees + free-text credential mentions).
// available=false when the user has no evidence at all (thin profile ≠ failing).
// ---------------------------------------------------------------------------

type CredentialSignal = {
  label: string;
  /** Exact match on additional_degrees[].degree (e.g., "MPH", "MBA", "MEd", "PhD") */
  exactDegreeTypes?: string[];
  /** Case-insensitive substring match in compiled credential text */
  keywords: string[];
};

const DOMAIN_CREDENTIAL_SIGNALS: CredentialSignal[][] = [
  // 0 Clinician — baseline: MD/DO + board cert assumed present, never flagged
  [],
  // 1 Educator
  [
    {
      label: "Master's in Health Professions Education (MHPE/MEd) or education fellowship",
      exactDegreeTypes: ["MEd", "Master's"],
      keywords: ["mhpe", "health professions education", "medical education certificate", "harvard macy", "teaching academy", "teaching fellowship", "education fellowship", "faculty development fellowship"],
    },
    {
      label: "Formal teaching certificate or academic faculty appointment",
      keywords: ["teaching certificate", "teaching award", "faculty appointment", "academic appointment", "associate professor", "assistant professor", "clinical professor"],
    },
  ],
  // 2 Researcher
  [
    {
      label: "Research degree (PhD or MSCR / MS in Clinical Research)",
      exactDegreeTypes: ["PhD", "Master's"],
      keywords: ["phd", "mscr", "ms in clinical research", "master of science in clinical research", "master of science in biostatistics", "research degree"],
    },
    {
      label: "NIH career-development award (K-award) or grant PI",
      keywords: ["k-award", "k award", "k01", "k08", "k23", "k99", "r01", "r21", "nih grant", "principal investigator", "grant pi", "career development award"],
    },
  ],
  // 3 Administrator / Leader
  [
    {
      label: "Business or management degree (MBA / MHA / MMM)",
      exactDegreeTypes: ["MBA"],
      keywords: ["mba", "mha", "mmm", "master of medical management", "master of health administration", "master of business administration", "master of healthcare"],
    },
    {
      label: "Certified Physician Executive (CPE) or leadership fellowship",
      keywords: ["cpe", "certified physician executive", "aapl", "elam", "executive leadership in academic medicine", "leadership fellowship", "administrative fellowship"],
    },
  ],
  // 4 Advocate
  [
    {
      label: "Public health degree (MPH or MS Public Health)",
      exactDegreeTypes: ["MPH"],
      keywords: ["mph", "master of public health", "master of science in public health", "ms public health"],
    },
    {
      label: "Health policy fellowship",
      keywords: ["rwjf", "robert wood johnson", "congressional fellowship", "health policy fellowship", "policy fellowship", "american college of physicians advocacy", "ama advocacy"],
    },
  ],
  // 5 Innovator
  [
    {
      label: "Clinical Informatics board certification (ABPM / ABP subspecialty)",
      keywords: ["clinical informatics", "abpm", "abp informatics", "board certified in clinical informatics", "informatics certification"],
    },
    {
      label: "MS Biomedical Informatics or design / innovation fellowship",
      exactDegreeTypes: ["Master's"],
      keywords: ["biomedical informatics", "health informatics", "ms informatics", "innovation fellowship", "design fellowship", "entrepreneurship fellowship"],
    },
  ],
  // 6 Quality / Safety
  [
    {
      label: "CPHQ or Certified Professional in Patient Safety (CPPS)",
      keywords: ["cphq", "cpps", "certified professional in healthcare quality", "certified professional in patient safety", "patient safety certification"],
    },
    {
      label: "IHI certification, Lean / Six Sigma, or MS Quality & Safety",
      keywords: ["ihi", "improvement advisor", "lean", "six sigma", "quality improvement certification", "ms quality", "patient safety certificate", "ihi open school"],
    },
  ],
  // 7 Wellness Champion
  [
    {
      label: "Professional coaching certification (NBHWC / ICF) or physician well-being certificate",
      keywords: ["nbhwc", "national board health wellness", "icf", "certified health coach", "lifestyle medicine", "ablm", "physician well-being", "well-being certificate", "coaching certification"],
    },
    {
      label: "Public health degree (MPH) or Lifestyle Medicine board certification",
      exactDegreeTypes: ["MPH"],
      keywords: ["mph", "master of public health", "lifestyle medicine", "ablm"],
    },
  ],
];

/**
 * Seven-gap computation on a stated goal domain (Part XV + Appendix H).
 *
 * Gap        | Source                                         | Status
 * -----------|------------------------------------------------|--------
 * Skill      | F1 density at goal domain's primary skills     | built
 * Knowledge  | Medical Knowledge density at goal domain       | built
 * Evidence   | OV-quadrant density at goal domain             | built
 * Identity   | Energy ranking alignment with goal domain      | built
 * Credential | CV credential signals vs domain table          | built (Phase 5)
 * Language   | Rosetta Layer vocabulary translation           | Phase 7
 * Network    | Mak coaching-probe data                        | Phase 6
 */
export async function computeSevenGap(
  userId: string,
  goalDomainIndex: number,
  supabase: SupabaseClient,
): Promise<SevenGapResult> {
  const now = new Date().toISOString();
  const f1  = await computeF1Density(userId, supabase);

  if (!f1.cells.length) {
    return {
      goal_domain_index: goalDomainIndex,
      gaps:              [],
      computed_at:       now,
      available:         false,
    };
  }

  // Build lookup: (skill_index, domain_index, quadrant) → density
  const densityAt = (si: number, di: number, quad?: string): number => {
    return f1.cells
      .filter((c) => c.skill_index === si && c.domain_index === di && (!quad || c.quadrant === quad))
      .reduce((s, c) => s + c.density, 0);
  };

  // Max density across all cells — used to normalize gap scores (ipsative)
  const maxDensity = f1.cells.reduce((m, c) => Math.max(m, c.density), 0.001);

  // Goal domain's primary skill indices
  const goalPrimaryNames = DOMAIN_PRIMARY_SKILLS[goalDomainIndex] ?? [];

  // Skill names → indices (SKILLS array order in constants.ts)
  const SKILL_NAMES = [
    "Clinical Expertise", "Medical Knowledge", "Practice-Based Learning",
    "Communication", "Professionalism & Ethics", "Systems Thinking",
    "Collaboration & Teamwork", "Personal & Professional Development",
  ];
  const skillIndex = (name: string): number => SKILL_NAMES.indexOf(name);

  // ── Gap 1: Skill ──────────────────────────────────────────────────────────
  // How thin is the physician's density at the goal domain's primary skills?
  const skillDensities = goalPrimaryNames.map((name) => {
    const si = skillIndex(name);
    return si >= 0 ? densityAt(si, goalDomainIndex) : 0;
  });
  const avgSkillDensity = skillDensities.length > 0
    ? skillDensities.reduce((s, v) => s + v, 0) / skillDensities.length
    : 0;
  const skillGap = Math.min(1, Math.max(0, 1 - avgSkillDensity / maxDensity));

  // ── Gap 2: Knowledge ─────────────────────────────────────────────────────
  const knowledgeDensity = densityAt(SKILL_IDX_MEDICAL_KNOWLEDGE, goalDomainIndex);
  const knowledgeGap = Math.min(1, Math.max(0, 1 - knowledgeDensity / maxDensity));

  // ── Gap 3: Evidence ───────────────────────────────────────────────────────
  // OV-quadrant density at goal domain (how documented is visible work there?)
  const ovDensityAtGoal = f1.cells
    .filter((c) => c.domain_index === goalDomainIndex && c.quadrant === "OV")
    .reduce((s, c) => s + c.density, 0);
  const evidenceGap = Math.min(1, Math.max(0, 1 - ovDensityAtGoal / maxDensity));

  // ── Gap 4: Identity (energy ranking alignment) ───────────────────────────
  const { data: rankings } = await supabase
    .from("energy_rankings")
    .select("domain_index, rank")
    .eq("user_id", userId)
    .eq("domain_index", goalDomainIndex)
    .single();
  const energyRank = rankings ? (rankings.rank as number) : null;
  // rank 5 = very energizing → gap 0; rank 1 = very draining → gap 1
  const identityGap = energyRank != null ? (5 - energyRank) / 4 : 0.5;

  // ── Gap 5: Credential ─────────────────────────────────────────────────────
  // Strengthening signal only — never a gate. Framing: "credentials common in
  // this direction," never "you're missing" or "required."
  // Clinician (0) = baseline assumed present; always gap 0.
  // available=false when no evidence exists (thin profile ≠ failing).
  let credentialScore = 0;
  let credentialAvailable = false;
  let credentialDescription = "";

  if (goalDomainIndex === 0) {
    // Clinician baseline — MD/DO + board cert assumed; never flag
    credentialScore = 0;
    credentialAvailable = true;
    credentialDescription = "Clinician credentials (MD/DO + board certification) assumed present";
  } else {
    const signals = DOMAIN_CREDENTIAL_SIGNALS[goalDomainIndex] ?? [];

    // Gather evidence: onboarding_metadata.additional_degrees + CV raw text
    const { data: userRow } = await supabase
      .from("app_users")
      .select("onboarding_metadata")
      .eq("user_id", userId)
      .maybeSingle();

    type DegreeEntry = { degree: string; field?: string | null; other_label?: string | null };
    const meta = (userRow?.onboarding_metadata ?? {}) as Record<string, unknown>;
    const additionalDegrees = (meta.additional_degrees as DegreeEntry[] | undefined) ?? [];

    // Query activity_entries text for credential mentions (gracefully skip if migration pending)
    let cvText = "";
    try {
      const { data: entries } = await supabase
        .from("activity_entries")
        .select("raw_text")
        .eq("user_id", userId)
        .limit(300);
      cvText = (entries ?? [])
        .map((e: { raw_text: string | null }) => e.raw_text ?? "")
        .join(" ")
        .toLowerCase();
    } catch {
      // activity_entries migration may not be applied; proceed without CV text
    }

    const degreeText = additionalDegrees
      .map((d) => `${d.degree} ${d.field ?? ""} ${d.other_label ?? ""}`)
      .join(" ")
      .toLowerCase();
    const allText = `${cvText} ${degreeText}`;

    const hasAnyEvidence = additionalDegrees.length > 0 || cvText.length > 10;

    if (!hasAnyEvidence || signals.length === 0) {
      credentialAvailable = false;
      credentialDescription = "Add your CV or degrees to see credential signals for this direction";
    } else {
      credentialAvailable = true;

      const isPresent = (sig: CredentialSignal): boolean => {
        const degreeMatch = sig.exactDegreeTypes?.some((dt) =>
          additionalDegrees.some((d) => d.degree.toLowerCase() === dt.toLowerCase()),
        ) ?? false;
        const kwMatch = sig.keywords.some((kw) => allText.includes(kw.toLowerCase()));
        return degreeMatch || kwMatch;
      };

      const presentCount = signals.filter(isPresent).length;
      credentialScore = signals.length > 0
        ? Math.max(0, 1 - presentCount / signals.length)
        : 0;

      if (credentialScore === 0) {
        const presentLabels = signals.filter(isPresent).map((s) => s.label);
        credentialDescription = `Credential signals present: ${presentLabels.join("; ")}`;
      } else {
        const absentLabels = signals.filter((s) => !isPresent(s)).map((s) => s.label);
        credentialDescription = `Credentials that would strengthen this direction: ${absentLabels.join("; ")}`;
      }
    }
  }

  const DOMAIN_LABELS = ["Clinician","Educator","Researcher","Administrator/Leader","Advocate","Innovator","Quality/Safety","Wellness Champion"];

  const gaps: SevenGap[] = [
    {
      name:        "Skill",
      score:       skillGap,
      available:   true,
      description: `Evidence density at ${goalPrimaryNames.join(", ")} in the ${DOMAIN_LABELS[goalDomainIndex] ?? ""} domain`,
    },
    {
      name:        "Knowledge",
      score:       knowledgeGap,
      available:   true,
      description: "Medical Knowledge evidence density at goal domain",
    },
    {
      name:        "Evidence",
      score:       evidenceGap,
      available:   true,
      description: "Visible (OV) evidence documented in goal domain",
    },
    {
      name:        "Identity",
      score:       identityGap,
      available:   energyRank != null,
      description: energyRank != null
        ? `Energy alignment with goal domain: ${energyRank}/5`
        : "Rate your energy for this domain to compute identity gap",
    },
    {
      name:        "Credential",
      score:       credentialScore,
      available:   credentialAvailable,
      description: credentialDescription,
    },
    {
      name:        "Language",
      score:       0,
      available:   false,
      // Spec Appendix H: Language gap = vocabulary translation fit.
      // Source: Output Studio Rosetta Layer — Phase 7.
      // Communication skill density is NOT a proxy (competency ≠ vocabulary). Do not substitute.
      description: "Vocabulary translation gap (Rosetta Layer — Output Studio, Phase 7)",
    },
    {
      name:        "Network",
      score:       0,
      available:   false,
      description: "Requires Mak coaching-probe data — Phase 6",
    },
  ];

  return {
    goal_domain_index: goalDomainIndex,
    gaps,
    computed_at:       now,
    available:         true,
  };
}
