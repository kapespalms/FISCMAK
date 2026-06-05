/**
 * One-way well-being aggregate for GME program dashboards.
 *
 * BOUNDARY RULE: this module reads individual trainee well-being data
 * (fcwi_responses, weekly_pulse, onboarding_metadata) via the admin client
 * (service-role) and returns ONLY aggregate prevalence counts — never any
 * individual row, never any trainee_id paired with a value.
 *
 * What is aggregated: burnout signal (EE/DP from weekly_pulse), MDT distress
 * prevalence, FCWI concern signal (items 1–6 only), and Ticket-1A env fields.
 *
 * What is NEVER included: energy_boost_task, energy_drain_task, item_7/8/9,
 * s_index, iwq, _internal_coaching, lattice/evidence/goal/Mak data.
 *
 * N≥5 suppression: every signal gates on its OWN respondent count, not the
 * cohort head-count. A 12-resident program where only 3 have recent pulse
 * data suppresses the burnout card while the FCWI card may still render.
 *
 * A3 provenance: weekly_pulse.ee ("How often this week did you feel
 * emotionally drained by your work?") and weekly_pulse.dp ("How often did
 * you feel disconnected from the people you work with or care for?") are
 * FISCMAK-owned paraphrases of the burnout construct — NOT MBI verbatim items.
 * Safe for institution-facing aggregation. The threshold max(ee,dp) ≥ 2 on
 * the 0-4 Never→Always scale equals "Sometimes or more," consistent with the
 * single-item burnout literature (West 2012).
 * Both the current-period band and the quarterly trend use this same
 * definition so the headline and sparkline always reconcile.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { EQUITY_MIN_CELL } from "@/lib/v2/gme/cohort-dashboard";

export type WellbeingBand = "low_concern" | "watch" | "elevated";

export type CohortWellbeingAggregate = {
  n: number;
  /** true when entire cohort < EQUITY_MIN_CELL — all signals suppressed */
  suppressed: boolean;
  burnout: {
    prevalence: number | null;
    band: WellbeingBand | null;
    respondent_n: number;
    suppressed: boolean;
  };
  mdt_distress: {
    prevalence: number | null;
    band: WellbeingBand | null;
    respondent_n: number;
    suppressed: boolean;
  };
  fcwi_concern: {
    prevalence: number | null;
    band: WellbeingBand | null;
    respondent_n: number;
    suppressed: boolean;
  };
  retention: {
    prevalence: number | null;
    flagged: boolean;
    /** pending = no env data collected yet (distinct from suppressed) */
    pending: boolean;
    /** suppressed = some data exists but < EQUITY_MIN_CELL respondents */
    suppressed: boolean;
    respondent_n: number;
  };
  environment: {
    values_alignment_mean: number | null;
    schedule_control_mean: number | null;
    respondent_n: number;
  };
  quarterly_trend: Array<{
    quarter: string;
    burnout_prevalence: number | null;
    respondent_n: number;
  }>;
  governance: {
    never_individual: true;
    never_career_direction: true;
  };
  computed_at: string;
};

// ---------------------------------------------------------------------------
// Band thresholds
// ---------------------------------------------------------------------------

function burnoutBand(p: number): WellbeingBand {
  if (p < 0.25) return "low_concern";
  if (p < 0.4) return "watch";
  return "elevated";
}

function mdtBand(p: number): WellbeingBand {
  if (p < 0.15) return "low_concern";
  if (p < 0.25) return "watch";
  return "elevated";
}

function fcwiBand(p: number): WellbeingBand {
  if (p < 0.25) return "low_concern";
  if (p < 0.4) return "watch";
  return "elevated";
}

// ---------------------------------------------------------------------------
// FCWI concern signal (no composite — Part XIX governance)
// Concern = negative mean (items 1+2) ≥ 2.5 OR positive mean (items 3+4+5+6) < 2.0
// Items 7, 8, 9 are excluded (individual-facing; not aggregated here).
// ---------------------------------------------------------------------------

function fcwiConcernFlag(row: {
  item_1: number; item_2: number; item_3: number;
  item_4: number; item_5: number; item_6: number;
}): boolean {
  const negativeMean = (row.item_1 + row.item_2) / 2;
  const positiveMean = (row.item_3 + row.item_4 + row.item_5 + row.item_6) / 4;
  return negativeMean >= 2.5 || positiveMean < 2.0;
}

// ---------------------------------------------------------------------------
// Suppressed aggregate (outer gate: cohort < EQUITY_MIN_CELL)
// ---------------------------------------------------------------------------

function suppressedAggregate(n: number): CohortWellbeingAggregate {
  return {
    n,
    suppressed: true,
    burnout: { prevalence: null, band: null, respondent_n: 0, suppressed: true },
    mdt_distress: { prevalence: null, band: null, respondent_n: 0, suppressed: true },
    fcwi_concern: { prevalence: null, band: null, respondent_n: 0, suppressed: true },
    retention: { prevalence: null, flagged: false, pending: true, suppressed: false, respondent_n: 0 },
    environment: { values_alignment_mean: null, schedule_control_mean: null, respondent_n: 0 },
    quarterly_trend: [],
    governance: { never_individual: true, never_career_direction: true },
    computed_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Raw row types (DB columns only — excluded fields are not in these types)
// ---------------------------------------------------------------------------

export type RawPulseRow = {
  user_id: string;
  ee: number | null;
  dp: number | null;
  mdt: number | null;
  recorded_at: string;
};

export type RawFcwiRow = {
  user_id: string;
  item_1: number;
  item_2: number;
  item_3: number;
  item_4: number;
  item_5: number;
  item_6: number;
  recorded_at: string;
};

export type RawEnvMeta = {
  user_id: string;
  /** typed onboarding_metadata env fields from Ticket 1A */
  meta: {
    intent_to_leave?: number | null;
    values_dept_alignment?: number | null;
    schedule_control?: number | null;
  };
};

// ---------------------------------------------------------------------------
// Quarter helper (A3: same definition used for current band and trend)
// ---------------------------------------------------------------------------

function toQuarter(recorded_at: string): string {
  const d = new Date(recorded_at);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${d.getFullYear()}-Q${q}`;
}

// ---------------------------------------------------------------------------
// Pure computation (no DB I/O — directly testable for boundary regression)
// ---------------------------------------------------------------------------

/**
 * Pure aggregation logic. Called by buildCohortWellbeingAggregate after
 * fetching raw rows. Exported so the boundary regression test can call it
 * with synthetic data without requiring a DB connection.
 *
 * env signals (retention, environment) read from RawEnvMeta.meta, which
 * comes from app_users.onboarding_metadata typed fields, NOT from
 * instrument_scores.career_environment.raw (the raw map uses −1 sentinel
 * for missing values; the typed fields use null, which is the correct
 * canonical source for Phase-5 formulas and this aggregate).
 */
export function computeWellbeingAggregate(input: {
  traineeIds: string[];
  pulseRows: RawPulseRow[];
  fcwiRows: RawFcwiRow[];
  envMetas: RawEnvMeta[];
}): CohortWellbeingAggregate {
  const n = input.traineeIds.length;
  const now = new Date().toISOString();

  if (n < EQUITY_MIN_CELL) {
    return { ...suppressedAggregate(n), computed_at: now };
  }

  // ── Burnout signal (max(ee,dp) ≥ 2) — most-recent pulse per trainee ──
  const latestPulse = dedupByUser(input.pulseRows);
  let burnoutCount = 0;
  let pulseN = 0;
  for (const [, row] of latestPulse) {
    const ee = row.ee ?? null;
    const dp = row.dp ?? null;
    if (ee == null && dp == null) continue;
    pulseN++;
    if (Math.max(ee ?? 0, dp ?? 0) >= 2) burnoutCount++;
  }
  const burnoutSuppressed = pulseN < EQUITY_MIN_CELL;
  const burnoutPrev = burnoutSuppressed ? null : round2(burnoutCount / pulseN);

  // ── MDT distress (mdt ≥ 4) — most-recent pulse per trainee ──
  let mdtCount = 0;
  let mdtN = 0;
  for (const [, row] of latestPulse) {
    if (row.mdt == null) continue;
    mdtN++;
    if (row.mdt >= 4) mdtCount++;
  }
  const mdtSuppressed = mdtN < EQUITY_MIN_CELL;
  const mdtPrev = mdtSuppressed ? null : round2(mdtCount / mdtN);

  // ── FCWI concern signal (items 1–6 only, most-recent per trainee) ──
  const latestFcwi = dedupByUser(input.fcwiRows);
  let fcwiConcernCount = 0;
  const fcwiN = latestFcwi.size;
  for (const [, row] of latestFcwi) {
    if (fcwiConcernFlag(row)) fcwiConcernCount++;
  }
  const fcwiSuppressed = fcwiN < EQUITY_MIN_CELL;
  const fcwiPrev = fcwiSuppressed ? null : round2(fcwiConcernCount / fcwiN);

  // ── Retention + environment signals (typed metadata fields from Ticket 1A) ──
  let itlCount = 0;
  let itlN = 0;
  let valuesSum = 0;
  let valuesN = 0;
  let schedSum = 0;
  let schedN = 0;

  for (const { meta } of input.envMetas) {
    const itl = meta.intent_to_leave;
    if (typeof itl === "number" && itl > 0) {
      itlN++;
      if (itl >= 4) itlCount++;
    }
    const va = meta.values_dept_alignment;
    if (typeof va === "number" && va > 0) { valuesSum += va; valuesN++; }
    const sc = meta.schedule_control;
    if (typeof sc === "number" && sc > 0) { schedSum += sc; schedN++; }
  }

  const retentionPending = itlN === 0;
  const retentionSuppressed = !retentionPending && itlN < EQUITY_MIN_CELL;
  const retentionPrev = (!retentionPending && !retentionSuppressed) ? round2(itlCount / itlN) : null;

  const envRespondentN = Math.min(valuesN, schedN);
  const valuesMean = valuesN >= EQUITY_MIN_CELL ? round2(valuesSum / valuesN) : null;
  const schedMean = schedN >= EQUITY_MIN_CELL ? round2(schedSum / schedN) : null;

  // ── Quarterly trend: same max(ee,dp)≥2 definition — all historical pulse rows
  //    bucketed by quarter, deduped to most-recent-per-trainee-per-quarter. ──
  const quarterUserMap = new Map<string, Map<string, RawPulseRow>>();
  for (const row of input.pulseRows) {
    const q = toQuarter(row.recorded_at);
    if (!quarterUserMap.has(q)) quarterUserMap.set(q, new Map());
    const userMap = quarterUserMap.get(q)!;
    const existing = userMap.get(row.user_id);
    if (!existing || row.recorded_at > existing.recorded_at) {
      userMap.set(row.user_id, row);
    }
  }
  const quarterly_trend = [...quarterUserMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, userMap]) => {
      const respondent_n = userMap.size;
      if (respondent_n < EQUITY_MIN_CELL) {
        return { quarter, burnout_prevalence: null, respondent_n };
      }
      let qBurnoutCount = 0;
      for (const row of userMap.values()) {
        if (Math.max(row.ee ?? 0, row.dp ?? 0) >= 2) qBurnoutCount++;
      }
      return { quarter, burnout_prevalence: round2(qBurnoutCount / respondent_n), respondent_n };
    });

  return {
    n,
    suppressed: false,
    burnout: {
      prevalence: burnoutPrev,
      band: burnoutPrev != null ? burnoutBand(burnoutPrev) : null,
      respondent_n: pulseN,
      suppressed: burnoutSuppressed,
    },
    mdt_distress: {
      prevalence: mdtPrev,
      band: mdtPrev != null ? mdtBand(mdtPrev) : null,
      respondent_n: mdtN,
      suppressed: mdtSuppressed,
    },
    fcwi_concern: {
      prevalence: fcwiPrev,
      band: fcwiPrev != null ? fcwiBand(fcwiPrev) : null,
      respondent_n: fcwiN,
      suppressed: fcwiSuppressed,
    },
    retention: {
      prevalence: retentionPrev,
      flagged: retentionPrev != null && retentionPrev > 0.25,
      pending: retentionPending,
      suppressed: retentionSuppressed,
      respondent_n: itlN,
    },
    environment: {
      values_alignment_mean: valuesMean,
      schedule_control_mean: schedMean,
      respondent_n: envRespondentN,
    },
    quarterly_trend,
    governance: { never_individual: true, never_career_direction: true },
    computed_at: now,
  };
}

// ---------------------------------------------------------------------------
// DB-facing wrapper (reads admin client, calls pure function)
// ---------------------------------------------------------------------------

export async function buildCohortWellbeingAggregate(
  traineeIds: string[],
  demo: boolean,
): Promise<CohortWellbeingAggregate> {
  const n = traineeIds.length;

  if (!isSupabaseConfigured() || demo || n === 0) {
    return suppressedAggregate(n);
  }

  if (n < EQUITY_MIN_CELL) {
    return suppressedAggregate(n);
  }

  const admin = createAdminClient();

  // Fetch only the columns needed for aggregate computation.
  // NEVER fetch: energy_boost_task, energy_drain_task, item_7/8/9, or any
  // career/evidence/goal/Mak columns.
  const [pulseResult, fcwiResult, usersResult] = await Promise.all([
    // ALL weekly_pulse rows (for current band AND quarterly trend — same definition)
    admin
      .from("weekly_pulse")
      .select("user_id, ee, dp, mdt, recorded_at")
      .in("user_id", traineeIds)
      .order("recorded_at", { ascending: false }),

    // Most-recent fcwi_responses per trainee (items 1–6 only)
    admin
      .from("fcwi_responses")
      .select("user_id, item_1, item_2, item_3, item_4, item_5, item_6, recorded_at")
      .in("user_id", traineeIds)
      .order("recorded_at", { ascending: false }),

    // Typed onboarding_metadata env fields (Ticket 1A) — canonical source for
    // env signals. Do NOT read instrument_scores.career_environment.raw here;
    // that map uses -1 sentinel for missing values, while the typed fields use null.
    admin
      .from("app_users")
      .select("user_id, onboarding_metadata")
      .in("user_id", traineeIds),
  ]);

  const pulseRows = (pulseResult.data ?? []) as RawPulseRow[];
  const fcwiRows = (fcwiResult.data ?? []) as RawFcwiRow[];
  const envMetas: RawEnvMeta[] = (
    (usersResult.data ?? []) as Array<{ user_id: string; onboarding_metadata: unknown }>
  ).map((row) => ({
    user_id: row.user_id as string,
    meta: (row.onboarding_metadata as RawEnvMeta["meta"] | null) ?? {},
  }));

  return computeWellbeingAggregate({ traineeIds, pulseRows, fcwiRows, envMetas });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dedupByUser<T extends { user_id: string; recorded_at: string }>(rows: T[]): Map<string, T> {
  const out = new Map<string, T>();
  for (const row of rows) {
    const existing = out.get(row.user_id);
    if (!existing || row.recorded_at > existing.recorded_at) {
      out.set(row.user_id, row);
    }
  }
  return out;
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
