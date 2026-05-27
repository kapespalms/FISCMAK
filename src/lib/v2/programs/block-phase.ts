import { parseIsoDate, toIsoDate } from "@/lib/v2/schedule-calendar/assignments";
import { expandUserEventOccurrences } from "@/lib/v2/schedule-calendar/event-expansion";
import type { ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

export type BlockPhase = "start" | "mid" | "end";

export type BlockPhaseContext = {
  phase: BlockPhase;
  block_id: string;
  rotation_code: string;
  rotation_label: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  days_elapsed: number;
};

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function detectBlockPhase(
  block: Pick<ScheduleBlock, "block_id" | "rotation_code" | "rotation_label" | "start_date" | "end_date">,
  asOf = new Date(),
): BlockPhaseContext | null {
  const start = parseIsoDate(block.start_date);
  const end = parseIsoDate(block.end_date);
  end.setHours(23, 59, 59, 999);

  if (asOf < start || asOf > end) return null;

  const totalDays = Math.max(1, daysBetween(start, end));
  const elapsed = Math.max(0, daysBetween(start, asOf));
  const remaining = Math.max(0, daysBetween(asOf, end));

  let phase: BlockPhase;
  if (elapsed <= 7 || elapsed / totalDays <= 0.15) {
    phase = "start";
  } else if (remaining <= 7 || remaining / totalDays <= 0.15) {
    phase = "end";
  } else if (elapsed / totalDays >= 0.38 && elapsed / totalDays <= 0.62) {
    phase = "mid";
  } else {
    return null;
  }

  return {
    phase,
    block_id: block.block_id,
    rotation_code: block.rotation_code,
    rotation_label: block.rotation_label,
    start_date: block.start_date,
    end_date: block.end_date,
    days_remaining: remaining,
    days_elapsed: elapsed,
  };
}

export function findCurrentBlockPhase(
  blocks: ScheduleBlock[],
  asOf = new Date(),
): BlockPhaseContext | null {
  for (const block of blocks) {
    const phase = detectBlockPhase(block, asOf);
    if (phase) return phase;
  }
  return null;
}
