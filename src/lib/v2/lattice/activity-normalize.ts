import type { ActivityEntry } from "@/lib/types/database";
import { DOMAINS, TRACKS } from "@/lib/constants";
import {
  inferDevelopmentLevel,
  keywordPlacement,
  normalizeFiscmakDomain,
  normalizeFiscmakTrack,
} from "@/lib/v2/lattice/ontology-bridge";
import {
  canonicalDomainLabel,
  canonicalTrackLabel,
  lookupActivityPlacement,
  lookupTrackKey,
  matchTextToActivityPlacement,
  resolveAcgmeFromDomainIndex,
} from "@/lib/v2/lattice/ontology-registry";

export type ResolvedLatticePlacement = {
  domainIndex: number;
  trackIndex: number;
  domainLabel: string;
  trackLabel: string;
  acgmeKey: string;
  developmentLevel: number;
  source: "ontology" | "canonical" | "keyword";
};

export function resolveActivityLatticePlacement(
  activity: Pick<
    ActivityEntry,
    "primary_domain" | "primary_track" | "raw_text"
  > & {
    inferred_activity_key?: string | null;
    inferred_career_track_keys?: string[] | null;
  },
): ResolvedLatticePlacement {
  const text = activity.raw_text ?? "";
  const trackKey =
    activity.inferred_career_track_keys?.[0] ??
    (activity.primary_track?.includes("_") ? activity.primary_track : null);

  const ontologyKey =
    activity.inferred_activity_key ??
    (activity.primary_domain?.includes("_") ? activity.primary_domain : null);

  const fromOntology = lookupActivityPlacement(ontologyKey, trackKey);
  if (fromOntology) {
    const level = inferDevelopmentLevel(text, fromOntology.defaultDevelopmentLevel);
    return {
      domainIndex: fromOntology.domainIndex,
      trackIndex: fromOntology.trackIndex,
      domainLabel: canonicalDomainLabel(fromOntology.domainIndex),
      trackLabel: canonicalTrackLabel(fromOntology.trackIndex),
      acgmeKey: fromOntology.acgmeKey,
      developmentLevel: level,
      source: "ontology",
    };
  }

  let domainIndex = normalizeFiscmakDomain(activity.primary_domain);
  let trackIndex = normalizeFiscmakTrack(activity.primary_track);
  if (trackIndex < 0 && activity.primary_track) {
    trackIndex = lookupTrackKey(activity.primary_track);
  }

  const textMatch = matchTextToActivityPlacement(text);
  if (textMatch && (domainIndex < 0 || trackIndex < 0)) {
    domainIndex = textMatch.domainIndex;
    trackIndex = textMatch.trackIndex;
  }

  const keyword = keywordPlacement(text);
  if (domainIndex < 0 && keyword) domainIndex = keyword.domainIndex;
  if (trackIndex < 0 && keyword) trackIndex = keyword.trackIndex;

  if (domainIndex < 0) domainIndex = 0;
  if (trackIndex < 0) trackIndex = 0;

  const developmentLevel = inferDevelopmentLevel(
    text,
    keyword?.developmentLevel ?? textMatch?.defaultDevelopmentLevel ?? 2,
  );
  const acgmeKey =
    textMatch?.acgmeKey ?? keyword?.acgmeKey ?? resolveAcgmeFromDomainIndex(domainIndex);

  const source =
    domainIndex >= 0 && DOMAINS.includes(activity.primary_domain as (typeof DOMAINS)[number])
      ? "canonical"
      : keyword || textMatch
        ? "keyword"
        : "ontology";

  return {
    domainIndex,
    trackIndex,
    domainLabel: canonicalDomainLabel(domainIndex),
    trackLabel: canonicalTrackLabel(trackIndex),
    acgmeKey,
    developmentLevel,
    source,
  };
}

/** Normalize persisted activity fields for lattice consumers */
export function normalizeActivityForLattice(
  activity: ActivityEntry & {
    inferred_activity_key?: string | null;
    inferred_career_track_keys?: string[] | null;
  },
): ActivityEntry {
  const resolved = resolveActivityLatticePlacement(activity);
  return {
    ...activity,
    primary_domain: resolved.domainLabel,
    primary_track: resolved.trackLabel,
  };
}
