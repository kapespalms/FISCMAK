import type { LatticeCellState } from "@/lib/constants";

/** Demo lattice until Supabase + activities are connected */
export function getDemoLatticeCells(): LatticeCellState[] {
  const seeds: Omit<LatticeCellState, "domainIndex" | "trackIndex">[] = [
    { activityCount: 12, energy: "energizing" },
    { activityCount: 8, energy: "energizing" },
    { activityCount: 5, energy: "neutral" },
    { activityCount: 3, energy: "draining" },
    { activityCount: 6, energy: "energizing" },
    { activityCount: 2, energy: "neutral" },
    { activityCount: 4, energy: "draining" },
    { activityCount: 7, energy: "energizing" },
  ];

  const cells: LatticeCellState[] = [];
  for (let d = 0; d < 8; d++) {
    for (let t = 0; t < 8; t++) {
      const seed = seeds[(d + t) % seeds.length];
      if ((d + t) % 3 === 0) {
        cells.push({
          domainIndex: d,
          trackIndex: t,
          activityCount: 0,
          energy: null,
        });
      } else {
        cells.push({ domainIndex: d, trackIndex: t, ...seed });
      }
    }
  }
  return cells;
}
