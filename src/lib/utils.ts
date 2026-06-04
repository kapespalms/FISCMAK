import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function energyCellClass(energy: string | null, count: number): string {
  if (count === 0) {
    return "border-cx-forest-dark/15 bg-cx-forest-dark/[0.04] text-cx-forest-dark/30";
  }
  if (energy === "very_draining" || energy === "draining") {
    return "border-[#A9744F] bg-[#C28D6C] text-white";           // fis-clay — no red
  }
  if (energy === "neutral") {
    return "border-[#34597A]/40 bg-[#6E93B8]/70 text-[#20201D]"; // neutral = muted steel substrate
  }
  return "border-[#2F6E4C] bg-[#3C8A60] text-white";             // fis-green — muted, not neon
}
