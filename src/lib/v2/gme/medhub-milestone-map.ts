import psychiatryMilestones from "../../../../docs/seeds/acgme/psychiatry_milestones_v2.json";

const MEDHUB_CROSSWALK = psychiatryMilestones.medhub_form_crosswalk as Record<string, string>;

/** Map MedHub CSV `milestone_XX_*` column keys to psychiatry subcompetency ids. */
export function medhubColumnToSubcompetencyId(columnKey: string): string | null {
  const match = columnKey.match(/^milestone_(\d{2})_/);
  if (!match) return null;
  const psychKey = `psych_milestone_${match[1]}`;
  return MEDHUB_CROSSWALK[psychKey] ?? null;
}

export function aggregateExternalRatings(
  evaluations: Array<{ numeric_scores?: Record<string, number> | null }>,
): Map<string, number> {
  const buckets = new Map<string, number[]>();

  for (const ev of evaluations) {
    const scores = ev.numeric_scores ?? {};
    for (const [column, value] of Object.entries(scores)) {
      if (!Number.isFinite(value)) continue;
      const subId = medhubColumnToSubcompetencyId(column);
      if (!subId) continue;
      const list = buckets.get(subId) ?? [];
      list.push(value);
      buckets.set(subId, list);
    }
  }

  const out = new Map<string, number>();
  for (const [subId, values] of buckets) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    out.set(subId, Math.round(avg * 10) / 10);
  }
  return out;
}
