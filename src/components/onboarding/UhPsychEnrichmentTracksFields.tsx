"use client";

import {
  UH_PSYCH_ENRICHMENT_TRACKS,
  type UhPsychEnrichmentTrack,
} from "@/lib/v2/programs/uh-psych-enrichment-tracks";

type UhPsychEnrichmentTracksFieldsProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  embedded?: boolean;
};

function TrackCard({
  track,
  active,
  onToggle,
}: {
  track: UhPsychEnrichmentTrack;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3 ${
        active
          ? "border-cx-forest-dark bg-cx-forest-dark/10"
          : "border-cx-forest-dark/15 hover:bg-cx-forest-dark/5"
      }`}
    >
      <input type="checkbox" checked={active} onChange={onToggle} className="mt-1 shrink-0" />
      <span className="min-w-0">
        <span className="font-futura-medium block text-base text-cx-forest-dark">{track.title}</span>
        <span className="font-futura-book mt-1 block text-sm leading-relaxed text-black">
          {track.description}
        </span>
        <span className="font-futura-book mt-1 block text-sm text-black">{track.eligibility}</span>
      </span>
    </label>
  );
}

export function UhPsychEnrichmentTracksFields({
  selected,
  onChange,
  embedded = false,
}: UhPsychEnrichmentTracksFieldsProps) {
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
          <p className="font-futura-medium text-base text-cx-forest-dark">UH Psychiatry program tracks</p>
          <p className="font-futura-book mt-1 text-base text-black">
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
        />
      ))}
    </div>
  );
}
