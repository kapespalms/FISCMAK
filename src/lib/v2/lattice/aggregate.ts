import type { ActivityEntry } from "@/lib/types/database";
import type { DocumentRecord } from "@/lib/v2/types";
import {
  ACGME_COMPETENCIES,
  ACGME_LEVELS,
  DOMAINS,
  TRACKS,
  acgmeLevelIndex,
} from "@/lib/v2/lattice/ontology-bridge";
import { resolveActivityLatticePlacement } from "@/lib/v2/lattice/activity-normalize";
import { resolveCachedDocumentEvidence } from "@/lib/v2/lattice/document-cache";
import type { LatticeDocumentCache } from "@/lib/v2/lattice/document-cache";
import { buildScheduleLatticeEvidence } from "@/lib/v2/lattice/schedule-lattice-evidence";
import { buildProfileLatticeEvidence } from "@/lib/v2/lattice/profile-lattice-evidence";
import { buildConfirmedDocumentLatticeEvidence } from "@/lib/v2/lattice/confirmed-document-evidence";
import { dedupeLatticeEvidence } from "@/lib/v2/lattice/evidence-dedup";
import type {
  LatticeCellMetrics,
  LatticeDashboardResponse,
  LatticeEvidence,
  LatticeGridModel,
  LatticeTimeframe,
} from "@/lib/v2/lattice/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";
import type { AppUser, CareerAssessment } from "@/lib/v2/types";

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

function energyBucket(energy: string | null): "energizing" | "draining" | "neutral" {
  if (!energy) return "neutral";
  if (energy.includes("drain")) return "draining";
  if (energy.includes("energiz")) return "energizing";
  return "neutral";
}

/** Mak chat captures stay off the lattice until explicitly confirmed. */
function isConfirmedActivity(a: ActivityEntry): boolean {
  const source = a.input_source ?? "";
  if (source === "chat" || source === "mak_capture") {
    return a.evidence_strength === "confirmed";
  }
  return true;
}

function activitiesToEvidence(activities: ActivityEntry[]): LatticeEvidence[] {
  return activities.filter(isConfirmedActivity).map((a) => {
    const resolved = resolveActivityLatticePlacement(a);
    return {
      id: a.id,
      source: "activity" as const,
      sourceLabel: a.input_source === "chat" ? "Mak capture" : "Activity log",
      rawText: a.raw_text ?? "",
      date: a.activity_date ?? a.created_at?.slice(0, 10) ?? null,
      energy: a.energy_valence,
      developmentLevel: resolved.developmentLevel,
      fiscmak: { domainIndex: resolved.domainIndex, trackIndex: resolved.trackIndex },
      acgme: {
        competencyKey: resolved.acgmeKey,
        levelIndex: acgmeLevelIndex(resolved.developmentLevel),
      },
    };
  });
}

export { isConfirmedActivity };

function aggregateFiscmak(evidence: LatticeEvidence[]): LatticeGridModel {
  const cells: LatticeCellMetrics[] = [];
  for (let di = 0; di < DOMAINS.length; di++) {
    for (let ti = 0; ti < TRACKS.length; ti++) {
      const matched = evidence.filter(
        (e) => e.fiscmak?.domainIndex === di && e.fiscmak?.trackIndex === ti,
      );
      cells.push(buildCellMetrics(di, ti, DOMAINS[di]!, TRACKS[ti]!, matched));
    }
  }
  applyRelativeIntensity(cells);
  return { kind: "fiscmak", rowLabels: [...DOMAINS], colLabels: [...TRACKS], cells };
}

function aggregateAcgme(evidence: LatticeEvidence[]): LatticeGridModel {
  const rowLabels = ACGME_LEVELS.map((l) => l.label);
  const colLabels = ACGME_COMPETENCIES.map((c) => c.name);
  const cells: LatticeCellMetrics[] = [];
  for (let li = 0; li < ACGME_LEVELS.length; li++) {
    for (let ci = 0; ci < ACGME_COMPETENCIES.length; ci++) {
      const key = ACGME_COMPETENCIES[ci]!.key;
      const matched = evidence.filter(
        (e) => e.acgme?.competencyKey === key && e.acgme?.levelIndex === li,
      );
      cells.push(
        buildCellMetrics(li, ci, rowLabels[li]!, colLabels[ci]!, matched),
      );
    }
  }
  applyRelativeIntensity(cells);
  return { kind: "acgme", rowLabels, colLabels, cells };
}

/** Representative level: mode across evidence items, falling back to max.
 *  Prevents a single "led" keyword in a CV snippet from inflating an entire
 *  cell to Level 4 when the bulk of evidence is Level 2–3. */
function representativeDevelopmentLevel(matched: LatticeEvidence[]): number {
  if (matched.length === 0) return 0;
  const freq: Record<number, number> = {};
  let maxLevel = 0;
  for (const e of matched) {
    freq[e.developmentLevel] = (freq[e.developmentLevel] ?? 0) + 1;
    if (e.developmentLevel > maxLevel) maxLevel = e.developmentLevel;
  }
  // Find the mode; ties broken by higher level
  let modeLevel = 0;
  let modeCount = 0;
  for (const [lvlStr, count] of Object.entries(freq)) {
    const lvl = Number(lvlStr);
    if (count > modeCount || (count === modeCount && lvl > modeLevel)) {
      modeLevel = lvl;
      modeCount = count;
    }
  }
  return modeLevel;
}

function buildCellMetrics(
  rowIndex: number,
  colIndex: number,
  rowLabel: string,
  colLabel: string,
  matched: LatticeEvidence[],
): LatticeCellMetrics {
  let energizingCount = 0;
  let drainingCount = 0;
  let neutralCount = 0;
  for (const e of matched) {
    const bucket = energyBucket(e.energy);
    if (bucket === "energizing") energizingCount += 1;
    else if (bucket === "draining") drainingCount += 1;
    else neutralCount += 1;
  }
  return {
    rowIndex,
    colIndex,
    rowLabel,
    colLabel,
    count: matched.length,
    relativeIntensity: 0,
    energizingCount,
    drainingCount,
    neutralCount,
    maxDevelopmentLevel: representativeDevelopmentLevel(matched),
    evidence: matched,
  };
}

function applyRelativeIntensity(cells: LatticeCellMetrics[]): void {
  const max = Math.max(1, ...cells.map((c) => c.count));
  for (const cell of cells) {
    cell.relativeIntensity = cell.count / max;
  }
}

export function buildLatticeDashboard(input: {
  activities: ActivityEntry[];
  documents: DocumentRecord[];
  timeframe: LatticeTimeframe;
  isTrainee: boolean;
  documentCache?: LatticeDocumentCache;
  scheduleEvents?: UserScheduleEvent[];
  programBlocks?: ScheduleBlock[];
  user?: AppUser;
  meta?: OnboardingMetadata;
  assessments?: CareerAssessment[];
}): {
  dashboard: LatticeDashboardResponse;
  documentCache: LatticeDocumentCache;
  documentCacheHit: boolean;
} {
  const { cache, fromCache } = resolveCachedDocumentEvidence(
    input.documents,
    input.documentCache,
  );
  const docEvidence = input.meta ? buildConfirmedDocumentLatticeEvidence(input.meta) : [];
  const activityEvidence = activitiesToEvidence(input.activities);
  const scheduleEvidence = buildScheduleLatticeEvidence({
    scheduleEvents: input.scheduleEvents ?? [],
    programBlocks: input.programBlocks ?? [],
    timeframe: input.timeframe,
  });
  const profileEvidence =
    input.user && input.meta
      ? buildProfileLatticeEvidence({
          user: input.user,
          meta: input.meta,
          assessments: input.assessments,
        })
      : [];
  const raw = [
    ...activityEvidence,
    ...docEvidence,
    ...scheduleEvidence,
    ...profileEvidence,
  ].filter((e) => inTimeframe(e.date, input.timeframe));

  const { deduped: all, rawCount, dedupedCount } = dedupeLatticeEvidence(raw);

  return {
    dashboard: {
      timeframe: input.timeframe,
      is_trainee: input.isTrainee,
      fiscmak: aggregateFiscmak(all),
      acgme: input.isTrainee ? aggregateAcgme(all) : null,
      evidence_total: dedupedCount,
      evidence_total_raw: rawCount,
      evidence_dedup_removed: rawCount - dedupedCount,
      document_evidence_count: all.filter((e) => e.source === "document").length,
      activity_evidence_count: all.filter((e) => e.source === "activity").length,
      schedule_evidence_count: all.filter((e) => e.source === "schedule").length,
      rotation_evidence_count: all.filter((e) => e.source === "rotation").length,
      profile_evidence_count: all.filter((e) => e.source === "profile").length,
      assessment_evidence_count: all.filter((e) => e.source === "assessment").length,
      goal_evidence_count: all.filter((e) => e.source === "goal").length,
      parsed_at: new Date().toISOString(),
    },
    documentCache: cache,
    documentCacheHit: fromCache,
  };
}
