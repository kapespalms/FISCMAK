import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function energyCellClass(energy: string | null, count: number): string {
  if (count === 0) {
    return "border-cx-forest-dark/15 bg-cx-forest-dark/[0.04] text-cx-forest-dark/30";
  }
  if (energy === "very_draining" || energy === "draining") {
    return "border-red-600 bg-red-500/90 text-white";
  }
  if (energy === "neutral") {
    return "border-amber-500 bg-amber-400/90 text-cx-forest-dark";
  }
  return "border-[#3BA33B] bg-[#5FD65F] text-cx-forest-dark";
}
