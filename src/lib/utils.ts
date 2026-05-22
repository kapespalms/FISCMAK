import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function energyCellClass(energy: string | null, count: number): string {
  if (count === 0) {
    return "bg-fiscmak-subtle border-fiscmak-border text-gray-400 opacity-30";
  }
  if (energy === "very_draining" || energy === "draining") {
    return "bg-fiscmak-red border-red-800 text-white opacity-100";
  }
  if (energy === "neutral") {
    return "bg-fiscmak-amber border-amber-700 text-white opacity-80";
  }
  return "bg-fiscmak-green border-fiscmak-green-dark text-white opacity-100";
}
