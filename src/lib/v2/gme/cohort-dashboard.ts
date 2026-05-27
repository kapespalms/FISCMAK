import type { AcgmeSubcompetency } from "@/lib/v2/gme/acgme-specialty-registry";
import { aggregateExternalRatings } from "@/lib/v2/gme/medhub-milestone-map";
import {
  expectedMilestoneLevelForPgy,
  heatmapCellFlag,
  type HeatmapCellFlag,
} from "@/lib/v2/gme/pgy-milestone-benchmarks";

export type CohortHeatmapCell = {
  trainee_id: string;
  subcompetency_id: string;
  external_level: number | null;
  self_level: number | null;
  expected_level: number;
  flag: HeatmapCellFlag;
};

export type CohortAssessmentVolume = {
  trainee_id: string;
  trainee_initials: string | null;
  pgy_level: string | null;
  eval_count: number;
  expected: number;
  sufficient: boolean;
};

export type CohortDashboard = {
  period: string;
  subcompetencies: Array<{
    id: string;
    number: number;
    name: string;
    medhub_outpatient_form?: boolean;
  }>;
  trainees: Array<{
    user_id: string;
    initials: string | null;
    pgy_level: string | null;
  }>;
  milestone_heatmap: CohortHeatmapCell[];
  assessment_volume: CohortAssessmentVolume[];
  narrative_quality_pct: number;
  equity_alerts: CohortEquityAlert[];
  summary: {
    trainee_count: number;
    total_evaluations: number;
    cohort_avg_milestone: number | null;
  };
};

type TraineeCohortInput = {
  user_id: string;
  initials: string | null;
  pgy_level: string | null;
  evaluations: Array<{
    numeric_scores?: Record<string, number> | null;
    narrative_text?: string | null;
  }>;
  self_ratings: Array<{ subcompetency_id: string; self_level: number | null }>;
};

export type CohortEquityAlert = {
  metric: string;
  group_delta: number | null;
  min_cell_suppressed: boolean;
  note: string;
};

const EQUITY_MIN_CELL = 5;

function buildEquityAlerts(
  trainees: TraineeCohortInput[],
  heatmap: CohortHeatmapCell[],
): CohortEquityAlert[] {
  if (trainees.length < EQUITY_MIN_CELL) {
    return [
      {
        metric: "cohort_milestone_avg",
        group_delta: null,
        min_cell_suppressed: true,
        note: `Cohort size (${trainees.length}) below n≥${EQUITY_MIN_CELL} — PGY subgroup comparison suppressed.`,
      },
    ];
  }

  const byPgy = new Map<string, number[]>();
  for (const trainee of trainees) {
    const pgy = trainee.pgy_level ?? "unknown";
    const levels = heatmap
      .filter((c) => c.trainee_id === trainee.user_id && c.external_level != null)
      .map((c) => c.external_level as number);
    if (!levels.length) continue;
    const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
    const bucket = byPgy.get(pgy) ?? [];
    bucket.push(avg);
    byPgy.set(pgy, bucket);
  }

  const groupAvgs = [...byPgy.entries()]
    .filter(([, vals]) => vals.length >= EQUITY_MIN_CELL)
    .map(([pgy, vals]) => ({
      pgy,
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    }));

  if (groupAvgs.length < 2) {
    return [
      {
        metric: "pgy_subgroup_milestone_avg",
        group_delta: null,
        min_cell_suppressed: true,
        note: "Insufficient PGY subgroup size for equity comparison (n≥5 per group required).",
      },
    ];
  }

  const max = groupAvgs.reduce((a, b) => (a.avg > b.avg ? a : b));
  const min = groupAvgs.reduce((a, b) => (a.avg < b.avg ? a : b));
  const delta = Math.round((max.avg - min.avg) * 100) / 100;

  return [
    {
      metric: "pgy_subgroup_milestone_avg",
      group_delta: delta,
      min_cell_suppressed: false,
      note: `Largest PGY subgroup gap: ${min.pgy} vs ${max.pgy} (Δ ${delta}). Review in CCC context only — not for individual ranking.`,
    },
  ];
}

export function buildCohortDashboard(input: {
  period: string;
  subcompetencies: AcgmeSubcompetency[];
  trainees: TraineeCohortInput[];
  expectedEvalsPerTrainee?: number;
}): CohortDashboard {
  const expectedEvals = input.expectedEvalsPerTrainee ?? 1;
  const heatmap: CohortHeatmapCell[] = [];
  const assessment_volume: CohortAssessmentVolume[] = [];
  let narrativesWithText = 0;
  let narrativeTotal = 0;
  const allExternalLevels: number[] = [];

  for (const trainee of input.trainees) {
    const externalMap = aggregateExternalRatings(trainee.evaluations);
    const selfMap = new Map(
      trainee.self_ratings
        .filter((r) => r.self_level != null)
        .map((r) => [r.subcompetency_id, r.self_level as number]),
    );
    const expected = expectedMilestoneLevelForPgy(trainee.pgy_level);

    for (const ev of trainee.evaluations) {
      narrativeTotal += 1;
      if (ev.narrative_text && ev.narrative_text.trim().length >= 80) {
        narrativesWithText += 1;
      }
    }

    for (const sub of input.subcompetencies) {
      const external = externalMap.get(sub.id) ?? null;
      const self = selfMap.get(sub.id) ?? null;
      if (external != null) allExternalLevels.push(external);
      heatmap.push({
        trainee_id: trainee.user_id,
        subcompetency_id: sub.id,
        external_level: external,
        self_level: self,
        expected_level: expected,
        flag: heatmapCellFlag(external ?? self, expected),
      });
    }

    assessment_volume.push({
      trainee_id: trainee.user_id,
      trainee_initials: trainee.initials,
      pgy_level: trainee.pgy_level,
      eval_count: trainee.evaluations.length,
      expected: expectedEvals,
      sufficient: trainee.evaluations.length >= expectedEvals,
    });
  }

  const cohortAvg =
    allExternalLevels.length > 0
      ? Math.round(
          (allExternalLevels.reduce((a, b) => a + b, 0) / allExternalLevels.length) * 100,
        ) / 100
      : null;

  return {
    period: input.period,
    subcompetencies: input.subcompetencies.map((s) => ({
      id: s.id,
      number: s.number,
      name: s.name,
      medhub_outpatient_form: s.medhub_outpatient_form,
    })),
    trainees: input.trainees.map((t) => ({
      user_id: t.user_id,
      initials: t.initials,
      pgy_level: t.pgy_level,
    })),
    milestone_heatmap: heatmap,
    assessment_volume,
    narrative_quality_pct:
      narrativeTotal > 0 ? Math.round((narrativesWithText / narrativeTotal) * 100) : 0,
    equity_alerts: buildEquityAlerts(input.trainees, heatmap),
    summary: {
      trainee_count: input.trainees.length,
      total_evaluations: input.trainees.reduce((n, t) => n + t.evaluations.length, 0),
      cohort_avg_milestone: cohortAvg,
    },
  };
}
