import Link from "next/link";
import { UH_PSYCH_ENRICHMENT_TRACKS } from "@/lib/v2/programs/uh-psych-enrichment-tracks";

type EnrichmentTracksSectionProps = {
  showElectivesLink?: boolean;
};

export function EnrichmentTracksSection({ showElectivesLink = false }: EnrichmentTracksSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-cx-forest-dark">Program paths</h2>
          <p className="text-xs text-cx-forest-dark/60">
            Optional enrichment tracks beyond core rotations.
          </p>
        </div>
        {showElectivesLink && (
          <Link
            href="/app/residency/electives"
            className="text-xs font-medium text-cx-forest-dark underline-offset-2 hover:underline"
          >
            Elective catalog →
          </Link>
        )}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {UH_PSYCH_ENRICHMENT_TRACKS.map((track) => (
          <li
            key={track.id}
            className="rounded-xl border border-cx-forest-dark/15 bg-white/90 p-4"
          >
            <p className="text-sm font-semibold text-cx-forest-dark">{track.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-cx-forest-dark/75">
              {track.description}
            </p>
            <p className="mt-2 text-xs text-cx-forest-dark/55">{track.eligibility}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
