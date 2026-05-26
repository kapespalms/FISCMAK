import type { CSSProperties } from "react";
import type { LatticeCellMetrics } from "@/lib/v2/lattice/types";

/** FISCMAK quantity — forest green light → dark */
const FISCMAK_QUANTITY = [
  "rgb(220 235 225)",
  "rgb(180 210 190)",
  "rgb(120 165 130)",
  "rgb(70 120 85)",
  "rgb(30 75 50)",
] as const;

/** ACGME quantity — lime → teal → navy (user palette) */
const ACGME_QUANTITY = [
  "rgb(240 250 230)",
  "rgb(200 240 160)",
  "rgb(120 210 180)",
  "rgb(40 140 150)",
  "rgb(15 35 75)",
] as const;

function quantityIndex(intensity: number): number {
  if (intensity <= 0) return 0;
  if (intensity < 0.2) return 1;
  if (intensity < 0.45) return 2;
  if (intensity < 0.75) return 3;
  return 4;
}

function energyAccent(cell: LatticeCellMetrics): {
  ring: string;
  glow: string;
} | null {
  const { energizingCount, drainingCount, count } = cell;
  if (count === 0) return null;
  if (energizingCount > drainingCount && energizingCount > 0) {
    return {
      ring: "ring-2 ring-[#C9A227]/80",
      glow: "shadow-[0_0_14px_rgba(201,162,39,0.55)]",
    };
  }
  if (drainingCount > energizingCount && drainingCount > 0) {
    return {
      ring: "ring-2 ring-[#CC5500]/75",
      glow: "shadow-[0_0_14px_rgba(204,85,0,0.45)]",
    };
  }
  return null;
}

export function latticeCellStyle(
  cell: LatticeCellMetrics,
  kind: "fiscmak" | "acgme",
): {
  className: string;
  style: CSSProperties;
} {
  const empty = cell.count === 0;
  const palette = kind === "fiscmak" ? FISCMAK_QUANTITY : ACGME_QUANTITY;
  const bg = empty ? "#f3f4f6" : palette[quantityIndex(cell.relativeIntensity)];
  const accent = energyAccent(cell);

  const className = [
    "relative flex items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200",
    empty
      ? "scale-[0.92] border-gray-200/80 text-gray-300 shadow-sm"
      : "scale-105 border-white/40 text-white shadow-md",
    accent?.ring ?? "",
    accent?.glow ?? (empty ? "" : "shadow-[0_0_12px_rgba(255,255,255,0.35)]"),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    className,
    style: {
      backgroundColor: bg,
      color: empty ? undefined : cell.relativeIntensity >= 0.45 ? "#fff" : "#1a3d2e",
    },
  };
}
