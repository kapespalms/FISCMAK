"use client";

import { cn } from "@/lib/utils";
import {
  UH_PSYCH_ENRICHMENT_TRACKS,
  type UhPsychEnrichmentTrack,
} from "@/lib/v2/programs/uh-psych-enrichment-tracks";

type UhPsychEnrichmentTracksFieldsProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  embedded?: boolean;
  variant?: "default" | "luxury";
};

function TrackCard({
  track,
  active,
  onToggle,
  luxury,
}: {
  track: UhPsychEnrichmentTrack;
  active: boolean;
  onToggle: () => void;
  luxury: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-xl border px-4 py-3",
        luxury
          ? active
            ? "border-fis-gold/30 bg-fis-gold/5"
            : "border-cx-forest-dark/15 bg-white hover:border-cx-forest-dark/30"
          : active
            ? "border-cx-forest-dark bg-cx-forest-dark/10"
            : "border-cx-forest-dark/15 hover:bg-cx-forest-dark/5",
      )}
    >
      <input
        type="checkbox"
        checked={active}
        onChange={onToggle}
        className={cn("mt-1 shrink-0", luxury && "accent-fis-gold")}
      />
      <span className="min-w-0">
        <span
          className={cn(
            "font-futura-medium block text-base",
            luxury ? "text-fis-gold" : "text-cx-text",
          )}
        >
          {track.title}
        </span>
        <span
          className={cn(
            "font-futura-book mt-1 block text-sm leading-relaxed",
            luxury ? "text-cx-text/60" : "text-black",
          )}
        >
          {track.description}
        </span>
        <span
          className={cn(
            "font-futura-book mt-1 block text-sm",
            luxury ? "text-cx-text/50" : "text-black",
          )}
        >
          {track.eligibility}
        </span>
      </span>
    </label>
  );
}

export function UhPsychEnrichmentTracksFields({
  selected,
  onChange,
  embedded = false,
  variant = "default",
}: UhPsychEnrichmentTracksFieldsProps) {
  const luxury = variant === "luxury";

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-2">
      {!embedded && (
        <div className="mb-3">
          <p
            className={cn(
              "font-futura-medium text-base",
              luxury ? "text-fis-gold" : "text-cx-text",
            )}
          >
            UH Psychiatry program tracks
          </p>
          <p
            className={cn(
              "font-futura-book mt-1 text-base",
              luxury ? "text-cx-text/50" : "text-black",
            )}
          >
            Optional enrichment pathways offered by your program.
          </p>
        </div>
      )}
      {UH_PSYCH_ENRICHMENT_TRACKS.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          active={selected.includes(track.id)}
          onToggle={() => toggle(track.id)}
          luxury={luxury}
        />
      ))}
    </div>
  );
}
