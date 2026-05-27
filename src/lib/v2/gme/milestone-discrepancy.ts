import type { AcgmeSubcompetency } from "@/lib/v2/gme/acgme-specialty-registry";
import { aggregateExternalRatings } from "@/lib/v2/gme/medhub-milestone-map";

export type DiscrepancyFlag = "none" | "watch" | "discuss";

export type DiscrepancyRow = {
  subcompetency_id: string;
  subcompetency_name: string;
  acgme_competency_key: string;
  self_level: number | null;
  external_level: number | null;
  delta: number | null;
  flag: DiscrepancyFlag;
  growth_area: boolean;
};

export function discrepancyFlag(delta: number | null): DiscrepancyFlag {
  if (delta == null) return "none";
  const abs = Math.abs(delta);
  if (abs >= 2) return "discuss";
  if (abs >= 1) return "watch";
  return "none";
}

export function buildDiscrepancyRows(input: {
  subcompetencies: AcgmeSubcompetency[];
  selfRatings: Map<string, number>;
  externalRatings: Map<string, number>;
}): DiscrepancyRow[] {
  return input.subcompetencies.map((sub) => {
    const self = input.selfRatings.get(sub.id) ?? null;
    const external = input.externalRatings.get(sub.id) ?? null;
    const delta =
      self != null && external != null ? Math.round((self - external) * 10) / 10 : null;
    const growth =
      external != null && self != null
        ? external <= 3.5 || (delta != null && delta < -0.5)
        : false;

    return {
      subcompetency_id: sub.id,
      subcompetency_name: sub.name,
      acgme_competency_key: sub.acgme_competency_key,
      self_level: self,
      external_level: external,
      delta,
      flag: discrepancyFlag(delta),
      growth_area: growth,
    };
  });
}

export function buildDiscrepancyFromEvaluations(input: {
  subcompetencies: AcgmeSubcompetency[];
  selfRatings: Array<{ subcompetency_id: string; self_level: number | null }>;
  evaluations: Array<{ numeric_scores?: Record<string, number> | null }>;
}): DiscrepancyRow[] {
  const selfMap = new Map(
    input.selfRatings
      .filter((r) => r.self_level != null)
      .map((r) => [r.subcompetency_id, r.self_level as number]),
  );
  const externalMap = aggregateExternalRatings(input.evaluations);
  return buildDiscrepancyRows({
    subcompetencies: input.subcompetencies,
    selfRatings: selfMap,
    externalRatings: externalMap,
  });
}

export type IlpDraftGoal = {
  subcompetency_id: string;
  subcompetency_name: string;
  goal_text: string;
  resources: string;
  source: "system_draft";
};

export function draftIlpGoalsFromDiscrepancy(rows: DiscrepancyRow[]): IlpDraftGoal[] {
  const candidates = rows.filter(
    (r) => r.growth_area || r.flag === "discuss" || r.flag === "watch",
  );

  return candidates.slice(0, 5).map((row) => {
    const focus =
      row.external_level != null && row.external_level <= 3.5
        ? `target milestone level ≥4.0`
        : row.delta != null && row.delta < 0
          ? `align self-assessment with faculty feedback`
          : `strengthen ${row.acgme_competency_key.toUpperCase()} performance`;

    return {
      subcompetency_id: row.subcompetency_id,
      subcompetency_name: row.subcompetency_name,
      goal_text: `By next semiannual review, ${focus} in ${row.subcompetency_name} — document progress in MedHub portfolio and rotation debriefs.`,
      resources: "Coach Mak capture · MedHub evals · CCC pre-read",
      source: "system_draft" as const,
    };
  });
}
