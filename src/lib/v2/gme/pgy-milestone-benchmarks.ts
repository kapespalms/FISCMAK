/** Typical ACGME psychiatry milestone expectations by PGY (pilot heuristic). */
const PGY_BENCHMARK: Record<string, number> = {
  "PGY-1": 3.0,
  PGY1: 3.0,
  "1": 3.0,
  "PGY-2": 3.5,
  PGY2: 3.5,
  "2": 3.5,
  "PGY-3": 4.0,
  PGY3: 4.0,
  "3": 4.0,
  "PGY-4": 4.5,
  PGY4: 4.5,
  "4": 4.5,
};

export function expectedMilestoneLevelForPgy(pgyLevel: string | null | undefined): number {
  if (!pgyLevel) return 3.5;
  const normalized = pgyLevel.trim().toUpperCase();
  return PGY_BENCHMARK[normalized] ?? PGY_BENCHMARK[normalized.replace(/\s+/g, "")] ?? 3.5;
}

export type HeatmapCellFlag = "above" | "on_track" | "watch" | "gap" | "missing";

export function heatmapCellFlag(
  level: number | null,
  expected: number,
): HeatmapCellFlag {
  if (level == null) return "missing";
  const delta = level - expected;
  if (delta >= 0.5) return "above";
  if (delta >= -0.25) return "on_track";
  if (delta >= -0.75) return "watch";
  return "gap";
}

export const HEATMAP_CELL_STYLES: Record<HeatmapCellFlag, string> = {
  above: "bg-[#5FD65F]/30 text-cx-forest-dark",
  on_track: "bg-cx-forest-dark/10 text-cx-forest-dark",
  watch: "bg-amber-100 text-amber-950",
  gap: "bg-red-100 text-red-900",
  missing: "bg-cx-forest-dark/5 text-cx-forest-dark/40",
};
