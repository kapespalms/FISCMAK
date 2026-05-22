import { DOMAINS, TRACKS, type EnergyValue, type LatticeCellState } from "@/lib/constants";
import type { ActivityEntry } from "@/lib/types/database";

function domainIndex(domain: string | null): number {
  if (!domain) return -1;
  const i = DOMAINS.indexOf(domain as (typeof DOMAINS)[number]);
  return i >= 0 ? i : 0;
}

function trackIndex(track: string | null): number {
  if (!track) return -1;
  const i = TRACKS.indexOf(track as (typeof TRACKS)[number]);
  return i >= 0 ? i : 0;
}

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
    const di = domainIndex(a.primary_domain);
    const ti = trackIndex(a.primary_track);
    if (di < 0 || ti < 0) continue;
    const key = `${di}-${ti}`;
    const cur = map.get(key) ?? { count: 0, energies: [] };
    cur.count += 1;
    if (a.energy_valence) cur.energies.push(a.energy_valence);
    map.set(key, cur);
  }

  const cells: LatticeCellState[] = [];
  for (let d = 0; d < 8; d++) {
    for (let t = 0; t < 8; t++) {
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
    activities.map((a) => a.primary_domain).filter(Boolean),
  );
  const tracks = new Set(
    activities.map((a) => a.primary_track).filter(Boolean),
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
