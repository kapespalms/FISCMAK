import type { ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";
import { expandUserEventOccurrences } from "@/lib/v2/schedule-calendar/event-expansion";
import { parseIsoDate } from "@/lib/v2/schedule-calendar/assignments";
import {
  acgmeLevelIndex,
  inferDevelopmentLevel,
  keywordPlacement,
  normalizeFiscmakDomain,
  normalizeFiscmakTrack,
} from "@/lib/v2/lattice/ontology-bridge";
import {
  getRotationOrientationPack,
  suggestLatticePlacements,
} from "@/lib/v2/programs/rotation-orientation";
import {
  matchTextToActivityPlacement,
  resolveAcgmeFromDomainIndex,
} from "@/lib/v2/lattice/ontology-registry";
import type { LatticeEvidence, LatticeTimeframe } from "@/lib/v2/lattice/types";

const EVENT_KIND_PLACEMENTS: Record<
  NonNullable<UserScheduleEvent["kind"]>,
  { domain: string; track: string; level: number }
> = {
  personal: { domain: "Personal & Professional Development", track: "Clinician", level: 2 },
  call: { domain: "Clinical Expertise", track: "Clinician", level: 3 },
  conference: { domain: "Scholarship & Learning", track: "Researcher", level: 3 },
  admin: { domain: "Leadership & Management", track: "Administrator/Leader", level: 3 },
  learning: { domain: "Scholarship & Learning", track: "Educator", level: 3 },
};

function timeframeStart(tf: LatticeTimeframe): Date | null {
  if (tf === "all") return null;
  const now = new Date();
  const d = new Date(now);
  if (tf === "30d") d.setDate(d.getDate() - 30);
  else if (tf === "90d") d.setDate(d.getDate() - 90);
  else d.setFullYear(d.getFullYear() - 1);
  return d;
}

function inTimeframe(dateStr: string | null, tf: LatticeTimeframe): boolean {
  const start = timeframeStart(tf);
  if (!start || !dateStr) return true;
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime()) && d >= start;
}

function blockOverlapsTimeframe(block: ScheduleBlock, tf: LatticeTimeframe): boolean {
  // Never include rotation blocks that haven't started yet — future rotations
  // are not career evidence; they inflate counts and development levels.
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const blockStart = parseIsoDate(block.start_date);
  if (blockStart > today) return false;

  const start = timeframeStart(tf);
  if (!start) return true;
  const blockEnd = parseIsoDate(block.end_date);
  return blockEnd >= start;
}

function resolvePlacementFromLabels(domain: string, track: string, text: string) {
  const domainIndex = normalizeFiscmakDomain(domain);
  const trackIndex = normalizeFiscmakTrack(track);
  const developmentLevel = inferDevelopmentLevel(text, 2);
  const acgmeKey = resolveAcgmeFromDomainIndex(domainIndex >= 0 ? domainIndex : 0);
  return {
    domainIndex: domainIndex >= 0 ? domainIndex : 0,
    trackIndex: trackIndex >= 0 ? trackIndex : 0,
    developmentLevel,
    acgmeKey,
  };
}

function resolveEventPlacement(event: UserScheduleEvent) {
  const text = [event.title, event.notes, event.kind].filter(Boolean).join(" ");

  if (event.lattice_domain?.trim() && event.lattice_track?.trim()) {
    return resolvePlacementFromLabels(event.lattice_domain, event.lattice_track, text);
  }

  const textMatch = matchTextToActivityPlacement(text);
  if (textMatch) {
    return {
      domainIndex: textMatch.domainIndex,
      trackIndex: textMatch.trackIndex,
      developmentLevel: inferDevelopmentLevel(text, textMatch.defaultDevelopmentLevel),
      acgmeKey: textMatch.acgmeKey,
    };
  }

  const keyword = keywordPlacement(text);
  if (keyword) {
    return {
      domainIndex: keyword.domainIndex,
      trackIndex: keyword.trackIndex,
      developmentLevel: inferDevelopmentLevel(text, keyword.developmentLevel),
      acgmeKey: keyword.acgmeKey,
    };
  }

  if (event.kind && EVENT_KIND_PLACEMENTS[event.kind]) {
    const preset = EVENT_KIND_PLACEMENTS[event.kind];
    return resolvePlacementFromLabels(preset.domain, preset.track, text);
  }

  return resolvePlacementFromLabels(
    "Personal & Professional Development",
    "Clinician",
    text,
  );
}

function firstDateInTimeframe(event: UserScheduleEvent, tf: LatticeTimeframe): string | null {
  const windowStart = timeframeStart(tf) ?? parseIsoDate("1970-01-01");
  const windowEnd = new Date();
  const occurrences = expandUserEventOccurrences(event, windowStart, windowEnd);
  const match = occurrences.find((iso) => inTimeframe(iso, tf));
  if (match) return match;
  const fallback = event.start_date.slice(0, 10);
  return inTimeframe(fallback, tf) ? fallback : null;
}

export function scheduleEventsToLatticeEvidence(
  events: UserScheduleEvent[],
  timeframe: LatticeTimeframe,
): LatticeEvidence[] {
  const out: LatticeEvidence[] = [];

  for (const event of events) {
    const date = firstDateInTimeframe(event, timeframe);
    if (!date) continue;

    const placement = resolveEventPlacement(event);
    const repeatNote = event.recurrence ? " (recurring)" : "";

    out.push({
      id: `schedule-${event.id}`,
      source: "schedule",
      sourceLabel: event.recurrence ? "Calendar · recurring" : "Calendar event",
      rawText: `${event.title}${repeatNote}${event.notes ? ` — ${event.notes}` : ""}`,
      date,
      energy: null,
      developmentLevel: placement.developmentLevel,
      fiscmak: {
        domainIndex: placement.domainIndex,
        trackIndex: placement.trackIndex,
      },
      acgme: {
        competencyKey: placement.acgmeKey,
        levelIndex: acgmeLevelIndex(placement.developmentLevel),
      },
    });
  }

  return out;
}

export function rotationBlocksToLatticeEvidence(
  blocks: ScheduleBlock[],
  timeframe: LatticeTimeframe,
): LatticeEvidence[] {
  const out: LatticeEvidence[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    if (!blockOverlapsTimeframe(block, timeframe)) continue;

    const pack = getRotationOrientationPack(block.rotation_code);
    const placements = suggestLatticePlacements(pack);
    const resolvedPlacements =
      placements.length > 0
        ? placements
        : [{ domain: "Clinical Expertise", track: "Clinician" }];

    for (const placement of resolvedPlacements.slice(0, 2)) {
      const key = `${block.rotation_code}:${placement.domain}:${placement.track}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const { domainIndex, trackIndex, developmentLevel, acgmeKey } =
        resolvePlacementFromLabels(placement.domain, placement.track, block.rotation_label);

      out.push({
        id: `rotation-${block.block_id}-${domainIndex}-${trackIndex}`,
        source: "rotation",
        sourceLabel: `${block.rotation_label} · program block`,
        rawText: `Training block: ${block.rotation_label} (${block.start_date} – ${block.end_date})`,
        date: block.start_date,
        energy: null,
        developmentLevel,
        fiscmak: { domainIndex, trackIndex },
        acgme: {
          competencyKey: acgmeKey,
          levelIndex: acgmeLevelIndex(developmentLevel),
        },
      });
    }
  }

  return out;
}

export function buildScheduleLatticeEvidence(input: {
  scheduleEvents: UserScheduleEvent[];
  programBlocks: ScheduleBlock[];
  timeframe: LatticeTimeframe;
}): LatticeEvidence[] {
  return [
    ...rotationBlocksToLatticeEvidence(input.programBlocks, input.timeframe),
    ...scheduleEventsToLatticeEvidence(input.scheduleEvents, input.timeframe),
  ];
}
