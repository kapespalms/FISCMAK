"use client";

import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { SCHEDULE_MAK } from "@/lib/card-mak-prompts";
import { uniqueRotationsFromBlocks } from "@/lib/v2/schedule-calendar/assignments";
import { personalEventCode } from "@/lib/v2/schedule-calendar/event-expansion";
import type { ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

type ScheduleKeyProps = {
  programBlocks: ScheduleBlock[];
  userEvents?: UserScheduleEvent[];
  colors: Record<string, string>;
  onColorChange: (code: string, hex: string) => void;
};

export function ScheduleKey({
  programBlocks,
  userEvents = [],
  colors,
  onColorChange,
}: ScheduleKeyProps) {
  const programRotations = uniqueRotationsFromBlocks(programBlocks);
  const personalEvents = userEvents.slice(0, 8);
  const isBlank = programRotations.length === 0 && personalEvents.length === 0;

  return (
    <div className="mt-3 border-t border-cx-forest-dark/10 pt-3">
      <p className="font-futura-medium mb-1.5 text-xs text-cx-forest-dark">Schedule Key</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {programRotations.map((r) => (
          <label
            key={r.rotation_code}
            className="font-futura-book flex max-w-full items-center gap-1 rounded-full border border-cx-forest-dark/12 bg-white px-1.5 py-0.5 text-[11px] leading-tight text-black"
          >
            <input
              type="color"
              value={colors[r.rotation_code] ?? "#CCCCCC"}
              onChange={(e) => onColorChange(r.rotation_code, e.target.value)}
              className="h-3 w-3 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              aria-label={`Color for ${r.rotation_label}`}
            />
            <span className="truncate">{r.rotation_label}</span>
          </label>
        ))}
        {personalEvents.map((event) => {
          const code = personalEventCode(event.id);
          return (
            <label
              key={event.id}
              className="font-futura-book flex max-w-full items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50/50 px-1.5 py-0.5 text-[11px] leading-tight text-black"
            >
              <input
                type="color"
                value={colors[code] ?? "#A5B4FC"}
                onChange={(e) => onColorChange(code, e.target.value)}
                className="h-3 w-3 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label={`Color for ${event.title}`}
              />
              <span className="truncate">{event.title}</span>
            </label>
          );
        })}
        <MakDiscussLink
          mak={SCHEDULE_MAK.addEvent}
          variant="chip"
          className={isBlank ? undefined : "ml-0.5"}
        />
      </div>
    </div>
  );
}
