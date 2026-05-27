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
    summary: {
      trainee_count: input.trainees.length,
      total_evaluations: input.trainees.reduce((n, t) => n + t.evaluations.length, 0),
      cohort_avg_milestone: cohortAvg,
    },
  };
}
