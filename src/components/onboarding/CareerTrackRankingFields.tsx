"use client";

import { useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIMARY_CAREER_TRACKS,
  usesFteForCareerTracks,
  type CareerLevel,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";

export type CareerTrackRanking = {
  track: PrimaryCareerTrack;
  rank: number;
  hours_per_week?: number;
  fte?: number;
};

type CareerTrackRankingFieldsProps = {
  careerLevel: CareerLevel;
  value: CareerTrackRanking[];
  onChange: (next: CareerTrackRanking[]) => void;
  variant?: "default" | "luxury";
};

function defaultRankings(): CareerTrackRanking[] {
  return PRIMARY_CAREER_TRACKS.map((track, index) => ({
    track,
    rank: index + 1,
    hours_per_week: undefined,
    fte: undefined,
  }));
}

export function buildDefaultCareerTrackRankings(): CareerTrackRanking[] {
  return defaultRankings();
}

export function hydrateCareerTrackRankings(
  stored: CareerTrackRanking[] | undefined,
  primaryTrack?: PrimaryCareerTrack | null,
): CareerTrackRanking[] {
  if (!stored?.length) {
    const base = defaultRankings();
    if (primaryTrack) {
      const idx = base.findIndex((r) => r.track === primaryTrack);
      if (idx > 0) {
        const [picked] = base.splice(idx, 1);
        base.unshift(picked);
        return base.map((r, i) => ({ ...r, rank: i + 1 }));
      }
    }
    return base;
  }
  const byTrack = new Map(stored.map((r) => [r.track, r]));
  return PRIMARY_CAREER_TRACKS.map((track, index) => {
    const existing = byTrack.get(track);
    return existing ?? { track, rank: index + 1 };
  }).sort((a, b) => a.rank - b.rank);
}

export function primaryTrackFromRankings(rankings: CareerTrackRanking[]): PrimaryCareerTrack {
  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  return sorted[0]?.track ?? "Clinician";
}

function reorderList(
  items: CareerTrackRanking[],
  fromIndex: number,
  toIndex: number,
): CareerTrackRanking[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((row, index) => ({ ...row, rank: index + 1 }));
}

type TrackRowProps = {
  row: CareerTrackRanking;
  index: number;
  useFte: boolean;
  dragIndex: number | null;
  luxury: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  onAllocation: (track: PrimaryCareerTrack, raw: string) => void;
};

function TrackRow({
  row,
  index,
  useFte,
  dragIndex,
  luxury,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onAllocation,
}: TrackRowProps) {
  const dragging = dragIndex === index;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(index);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-2 py-2",
        luxury
          ? dragging
            ? "border-[#A3E635]/50 bg-[#1C2030] opacity-90"
            : "border-white/5 bg-[#0A0C10]"
          : dragging
            ? "border-cx-forest-dark/40 bg-cx-forest-dark/10 opacity-80"
            : "border-cx-forest-dark/15 bg-white",
      )}
    >
      <button
        type="button"
        className={cn(
          "cursor-grab touch-none px-1 active:cursor-grabbing",
          luxury ? "text-gray-500" : "text-cx-forest-dark/45",
        )}
        aria-label={`Drag to reorder ${row.track}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} aria-hidden />
      </button>
      <span
        className={cn(
          "font-futura-bold w-8 shrink-0 text-center text-base tabular-nums",
          luxury ? "text-fis-gold" : "text-cx-forest-dark",
        )}
      >
        {row.rank}
      </span>
      <span
        className={cn(
          "font-futura-medium min-w-0 flex-1 text-base",
          luxury ? "text-white" : "text-black",
        )}
      >
        {row.track}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <input
          type="number"
          min={0}
          max={useFte ? 1 : 80}
          step={useFte ? 0.1 : 1}
          placeholder={useFte ? "FTE" : "hrs"}
          value={useFte ? (row.fte ?? "") : (row.hours_per_week ?? "")}
          onChange={(e) => onAllocation(row.track, e.target.value)}
          className={cn(
            "w-[4.75rem] py-1.5 text-base",
            luxury
              ? "rounded-lg border border-white/5 bg-[#141722] px-2 text-white placeholder:text-gray-600 focus:border-[#A3E635] focus:outline-none"
              : "cx-field text-black",
          )}
          aria-label={`${useFte ? "FTE" : "Hours per week"} for ${row.track}`}
        />
        <span
          className={cn(
            "font-futura-book w-9 text-sm",
            luxury ? "text-gray-500" : "text-black",
          )}
        >
          {useFte ? "FTE" : "hrs/wk"}
        </span>
      </div>
    </div>
  );
}

export function CareerTrackRankingFields({
  careerLevel,
  value,
  onChange,
  variant = "default",
}: CareerTrackRankingFieldsProps) {
  const luxury = variant === "luxury";
  const useFte = usesFteForCareerTracks(careerLevel);
  const sorted = useMemo(
    () => [...value].sort((a, b) => a.rank - b.rank),
    [value],
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const left = sorted.slice(0, 4);
  const right = sorted.slice(4, 8);

  function setAllocation(track: PrimaryCareerTrack, raw: string) {
    const parsed = raw === "" ? undefined : Number(raw);
    onChange(
      value.map((row) => {
        if (row.track !== track) return row;
        if (useFte) {
          return { ...row, fte: parsed, hours_per_week: undefined };
        }
        return { ...row, hours_per_week: parsed, fte: undefined };
      }),
    );
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    onChange(reorderList(sorted, dragIndex, targetIndex));
    setDragIndex(null);
    setOverIndex(null);
  }

  function renderColumn(items: CareerTrackRanking[], startIndex: number) {
    return items.map((row, offset) => {
      const index = startIndex + offset;
      return (
        <TrackRow
          key={row.track}
          row={row}
          index={index}
          useFte={useFte}
          luxury={luxury}
          dragIndex={dragIndex}
          onDragStart={setDragIndex}
          onDragOver={setOverIndex}
          onDrop={handleDrop}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onAllocation={setAllocation}
        />
      );
    });
  }

  const columnLabelClass = cn(
    "font-futura-medium text-sm uppercase tracking-wide",
    luxury ? "text-[#D4AF37]" : "text-cx-forest-dark",
  );

  return (
    <div className="space-y-4 font-futura-book">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2" aria-label="Career tracks ranks 1 through 4">
          <p className={columnLabelClass}>Most energizing</p>
          {renderColumn(left, 0)}
        </div>
        <div className="space-y-2" aria-label="Career tracks ranks 5 through 8">
          <p className={columnLabelClass}>Least energizing</p>
          {renderColumn(right, 4)}
        </div>
      </div>

      {overIndex !== null && dragIndex !== null && overIndex !== dragIndex && (
        <p className={cn("text-sm", luxury ? "text-gray-500" : "text-black")} aria-live="polite">
          Drop to move {sorted[dragIndex]?.track} to rank {overIndex + 1}.
        </p>
      )}
    </div>
  );
}
