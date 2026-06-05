import { describe, it, expect } from "vitest";
import { computeWellbeingAggregate } from "@/lib/v2/gme/cohort-wellbeing-aggregate";
import type { RawPulseRow, RawFcwiRow, RawEnvMeta } from "@/lib/v2/gme/cohort-wellbeing-aggregate";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTrainees(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `trainee-${i + 1}`);
}

function makePulseRow(userId: string, overrides: Partial<RawPulseRow> = {}): RawPulseRow {
  return {
    user_id: userId,
    ee: 1,
    dp: 1,
    mdt: 2,
    recorded_at: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

function makeFcwiRow(userId: string, overrides: Partial<RawFcwiRow> = {}): RawFcwiRow {
  return {
    user_id: userId,
    item_1: 1, item_2: 1, item_3: 3, item_4: 3, item_5: 3, item_6: 3,
    recorded_at: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

function makeEnvMeta(userId: string, meta: RawEnvMeta["meta"] = {}): RawEnvMeta {
  return { user_id: userId, meta };
}

// ---------------------------------------------------------------------------
// A2 — Test 1: Boundary sentinel leak — no excluded field or value escapes
// ---------------------------------------------------------------------------

describe("cohort-wellbeing-aggregate boundary", () => {
  const SENTINEL = "SENTINEL_PHI_8f3a";
  const TRAINEE_IDS = makeTrainees(6);

  // Build synthetic rows that include the EXCLUDED fields as overrides
  // (in a real DB query these columns wouldn't be selected, but we verify
  // the PURE function also never surfaces them in its output).
  const pulseRows: RawPulseRow[] = TRAINEE_IDS.map((id) =>
    makePulseRow(id, { ee: 3, dp: 2, mdt: 5 }),
  );
  const fcwiRows: RawFcwiRow[] = TRAINEE_IDS.map((id) =>
    makeFcwiRow(id, { item_1: 3, item_2: 3, item_3: 1, item_4: 1, item_5: 1, item_6: 1 }),
  );
  const envMetas: RawEnvMeta[] = TRAINEE_IDS.map((id) =>
    makeEnvMeta(id, { intent_to_leave: 4, values_dept_alignment: 2, schedule_control: 2 }),
  );

  it("returns a result without trainee_id or user_id at any depth", () => {
    const result = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows,
      fcwiRows,
      envMetas,
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('"trainee_id"');
    expect(serialized).not.toContain('"user_id"');
    // No trainee id value should appear
    for (const id of TRAINEE_IDS) {
      expect(serialized).not.toContain(id);
    }
  });

  it("result JSON contains none of the excluded field names", () => {
    const result = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows,
      fcwiRows,
      envMetas,
    });

    const serialized = JSON.stringify(result);
    const excluded = [
      "energy_boost_task",
      "energy_drain_task",
      "item_7",
      "item_8",
      "item_9",
      "s_index",
      "iwq",
      "_internal_coaching",
      "lattice_cell",
      "evidence_unit",
      "goal_record",
      "mak_conversation",
    ];
    for (const field of excluded) {
      expect(serialized, `"${field}" should not appear in output`).not.toContain(`"${field}"`);
    }
  });

  it("result JSON does not contain the PHI sentinel value", () => {
    // Even if a row somehow carried the sentinel in a non-excluded column,
    // the aggregation must not propagate verbatim strings.
    const pulseWithSentinel = TRAINEE_IDS.map((id) =>
      // Cast to any to simulate a row with an extra field not in the type
      ({ ...makePulseRow(id), energy_drain_task: SENTINEL } as unknown as RawPulseRow),
    );
    const result = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows: pulseWithSentinel,
      fcwiRows,
      envMetas,
    });

    expect(JSON.stringify(result)).not.toContain(SENTINEL);
  });

  it("produces non-null prevalences when cohort ≥ 5 and all respondents have data", () => {
    const result = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows,
      fcwiRows,
      envMetas,
    });

    expect(result.suppressed).toBe(false);
    // All 6 trainees have pulse data → burnout and MDT respondent_n = 6
    expect(result.burnout.suppressed).toBe(false);
    expect(result.burnout.respondent_n).toBe(6);
    expect(result.burnout.prevalence).not.toBeNull();
    // All trainees have ee=3 or dp=2 → max(3,2)=3 ≥ 2 → 100% burnout signal
    expect(result.burnout.prevalence).toBe(1);
    expect(result.burnout.band).toBe("elevated");

    expect(result.fcwi_concern.suppressed).toBe(false);
    expect(result.fcwi_concern.respondent_n).toBe(6);

    expect(result.retention.pending).toBe(false);
    expect(result.retention.suppressed).toBe(false);
    expect(result.retention.respondent_n).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// A2 — Test 2: Cohort of 4 → everything suppressed (locks A1 outer gate)
// ---------------------------------------------------------------------------

describe("cohort-wellbeing-aggregate suppression", () => {
  const SMALL_IDS = makeTrainees(4);

  it("suppresses all signals when cohort < 5", () => {
    const result = computeWellbeingAggregate({
      traineeIds: SMALL_IDS,
      pulseRows: SMALL_IDS.map((id) => makePulseRow(id, { ee: 3, dp: 3, mdt: 8 })),
      fcwiRows: SMALL_IDS.map((id) => makeFcwiRow(id)),
      envMetas: SMALL_IDS.map((id) => makeEnvMeta(id, { intent_to_leave: 5 })),
    });

    expect(result.suppressed).toBe(true);
    expect(result.burnout.suppressed).toBe(true);
    expect(result.burnout.prevalence).toBeNull();
    expect(result.mdt_distress.suppressed).toBe(true);
    expect(result.mdt_distress.prevalence).toBeNull();
    expect(result.fcwi_concern.suppressed).toBe(true);
    expect(result.fcwi_concern.prevalence).toBeNull();
    expect(result.retention.prevalence).toBeNull();
    expect(result.quarterly_trend).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// A1 — Per-metric suppression: burnout can suppress while retention renders
// ---------------------------------------------------------------------------

describe("cohort-wellbeing-aggregate per-metric N≥5", () => {
  // 6 trainees total, but only 3 have weekly_pulse data (burnout suppresses),
  // while all 6 have env metadata (retention renders).
  const TRAINEE_IDS = makeTrainees(6);

  it("suppresses burnout independently when pulse respondent_n < 5", () => {
    const result = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      // Only 3 trainees have pulse data
      pulseRows: makeTrainees(3).map((id) => makePulseRow(id, { ee: 1, dp: 1 })),
      fcwiRows: [],
      envMetas: TRAINEE_IDS.map((id) =>
        makeEnvMeta(id, { intent_to_leave: 2 }),
      ),
    });

    // Outer cohort gate passes (n=6 ≥ 5)
    expect(result.suppressed).toBe(false);

    // Burnout suppressed (only 3 respondents)
    expect(result.burnout.suppressed).toBe(true);
    expect(result.burnout.prevalence).toBeNull();
    expect(result.burnout.respondent_n).toBe(3);

    // Retention renders (6 respondents)
    expect(result.retention.suppressed).toBe(false);
    expect(result.retention.pending).toBe(false);
    expect(result.retention.respondent_n).toBe(6);
    expect(result.retention.prevalence).not.toBeNull();
  });

  it("distinguishes retention pending (0 respondents) from suppressed (1–4)", () => {
    const pendingResult = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows: [],
      fcwiRows: [],
      // No env data at all
      envMetas: TRAINEE_IDS.map((id) => makeEnvMeta(id, {})),
    });
    expect(pendingResult.retention.pending).toBe(true);
    expect(pendingResult.retention.suppressed).toBe(false);

    const suppressedResult = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows: [],
      fcwiRows: [],
      // Only 3 trainees have intent_to_leave data
      envMetas: [
        ...makeTrainees(3).map((id) => makeEnvMeta(id, { intent_to_leave: 4 })),
        ...makeTrainees(3).map((_, i) => makeEnvMeta(`extra-${i}`, {})),
      ],
    });
    expect(suppressedResult.retention.pending).toBe(false);
    expect(suppressedResult.retention.suppressed).toBe(true);
    expect(suppressedResult.retention.prevalence).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// A3 — Burnout band and trend use the same max(ee,dp)≥2 definition
// ---------------------------------------------------------------------------

describe("cohort-wellbeing-aggregate burnout consistency (A3)", () => {
  // 10 trainees: 5 have ONLY a Q1 row (ee=3, burnout), 5 have ONLY a Q2 row (ee=0).
  // Each quarter reaches N≥5, so trend renders. Current band uses most-recent per user.
  const TRAINEE_IDS = makeTrainees(10);

  it("quarterly trend uses same max(ee,dp)≥2 threshold as current band", () => {
    const pulseRows: RawPulseRow[] = TRAINEE_IDS.map((id, i) =>
      makePulseRow(id, {
        ee: i < 5 ? 3 : 0,
        dp: 0,
        recorded_at: i < 5 ? "2026-01-15T10:00:00Z" : "2026-04-15T10:00:00Z",
      }),
    );

    const result = computeWellbeingAggregate({
      traineeIds: TRAINEE_IDS,
      pulseRows,
      fcwiRows: [],
      envMetas: TRAINEE_IDS.map((id) => makeEnvMeta(id)),
    });

    // Cohort not suppressed (n=10)
    expect(result.suppressed).toBe(false);

    // Current band: most-recent per user — 5 have Q1 (ee=3, burnout), 5 have Q2 (ee=0) → 50%
    expect(result.burnout.respondent_n).toBe(10);
    expect(result.burnout.prevalence).toBe(0.5);

    // Trend: Q1-2026 → 5 respondents, all burned out (ee=3) → 100%
    const q1 = result.quarterly_trend.find((t) => t.quarter === "2026-Q1");
    expect(q1?.respondent_n).toBe(5);
    expect(q1?.burnout_prevalence).toBe(1);

    // Trend: Q2-2026 → 5 respondents, none burned out (ee=0) → 0%
    const q2 = result.quarterly_trend.find((t) => t.quarter === "2026-Q2");
    expect(q2?.respondent_n).toBe(5);
    expect(q2?.burnout_prevalence).toBe(0);
  });
});
