import {
  SKILLS,
  DOMAINS,
  type EnergyValue,
  type LatticeCellState,
} from "@/lib/constants";
import type { ActivityEntry } from "@/lib/types/database";
import { resolveActivityLatticePlacement } from "@/lib/v2/lattice/activity-normalize";

function dominantEnergy(energies: string[]): EnergyValue | null {
  if (energies.length === 0) return null;
  const scores: Record<string, number> = {};
  for (const e of energies) {
    scores[e] = (scores[e] ?? 0) + 1;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (sorted[0]?.[0] as EnergyValue) ?? null;
}

export function activitiesToLatticeCells(
  activities: ActivityEntry[],
): LatticeCellState[] {
  const map = new Map<string, { count: number; energies: string[] }>();

  for (const a of activities) {
    const { domainIndex, trackIndex } = resolveActivityLatticePlacement(a);
    const key = `${domainIndex}-${trackIndex}`;
    const cur = map.get(key) ?? { count: 0, energies: [] };
    cur.count += 1;
    if (a.energy_valence) cur.energies.push(a.energy_valence);
    map.set(key, cur);
  }

  const cells: LatticeCellState[] = [];
  for (let d = 0; d < SKILLS.length; d++) {
    for (let t = 0; t < DOMAINS.length; t++) {
      const key = `${d}-${t}`;
      const data = map.get(key);
      cells.push({
        domainIndex: d,
        trackIndex: t,
        activityCount: data?.count ?? 0,
        energy: data ? dominantEnergy(data.energies) : null,
      });
    }
  }
  return cells;
}

export function getDashboardStats(activities: ActivityEntry[]) {
  const domains = new Set(
    activities
      .map((a) => resolveActivityLatticePlacement(a).domainLabel)
      .filter(Boolean),
  );
  const tracks = new Set(
    activities
      .map((a) => resolveActivityLatticePlacement(a).trackLabel)
      .filter(Boolean),
  );
  const energizing = activities.filter((a) =>
    a.energy_valence?.includes("energiz"),
  ).length;
  const draining = activities.filter((a) =>
    a.energy_valence?.includes("drain"),
  ).length;
  const documented = activities.filter(
    (a) => a.evidence_strength === "documented",
  ).length;
  const recognitionGap =
    activities.length > 0
      ? Math.round(
          ((activities.length - documented) / activities.length) * 100,
        )
      : 0;

  return {
    total: activities.length,
    domainsActive: domains.size,
    tracksActive: tracks.size,
    energizing,
    draining,
    recognitionGap,
  };
}
