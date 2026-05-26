import type { ActivityEntry } from "@/lib/types/database";
import type { DocumentRecord } from "@/lib/v2/types";
import {
  ACGME_COMPETENCIES,
  ACGME_LEVELS,
  DOMAINS,
  TRACKS,
  acgmeLevelIndex,
  inferDevelopmentLevel,
  keywordPlacement,
  normalizeFiscmakDomain,
  normalizeFiscmakTrack,
} from "@/lib/v2/lattice/ontology-bridge";
import { parseDocumentsToLatticeEvidence } from "@/lib/v2/lattice/document-parser";
import type {
  LatticeCellMetrics,
  LatticeDashboardResponse,
  LatticeEvidence,
  LatticeGridModel,
  LatticeTimeframe,
} from "@/lib/v2/lattice/types";

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

function activitiesToEvidence(activities: ActivityEntry[]): LatticeEvidence[] {
  return activities.map((a) => {
    let domainIndex = normalizeFiscmakDomain(a.primary_domain);
    let trackIndex = normalizeFiscmakTrack(a.primary_track);
    let acgmeKey = "pc";
    let developmentLevel = 2;

    const text = a.raw_text ?? "";
    const keyword = keywordPlacement(text);
    if (domainIndex < 0 && keyword) {
      domainIndex = keyword.domainIndex;
      trackIndex = keyword.trackIndex;
      acgmeKey = keyword.acgmeKey;
      developmentLevel = keyword.developmentLevel;
    } else if (keyword) {
      acgmeKey = keyword.acgmeKey;
      developmentLevel = inferDevelopmentLevel(text, keyword.developmentLevel);
    }

    if (domainIndex < 0) domainIndex = 0;
    if (trackIndex < 0) trackIndex = 0;

    return {
      id: a.id,
      source: "activity" as const,
      sourceLabel: a.input_source === "chat" ? "Mak capture" : "Activity log",
      rawText: text,
      date: a.activity_date ?? a.created_at?.slice(0, 10) ?? null,
      energy: a.energy_valence,
      developmentLevel,
      fiscmak: { domainIndex, trackIndex },
      acgme: { competencyKey: acgmeKey, levelIndex: acgmeLevelIndex(developmentLevel) },
    };
  });
}

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
    maxDevelopmentLevel: matched.reduce((m, e) => Math.max(m, e.developmentLevel), 0),
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
}): LatticeDashboardResponse {
  const docEvidence = parseDocumentsToLatticeEvidence(input.documents);
  const activityEvidence = activitiesToEvidence(input.activities);
  const all = [...activityEvidence, ...docEvidence].filter((e) =>
    inTimeframe(e.date, input.timeframe),
  );

  return {
    timeframe: input.timeframe,
    is_trainee: input.isTrainee,
    fiscmak: aggregateFiscmak(all),
    acgme: input.isTrainee ? aggregateAcgme(all) : null,
    evidence_total: all.length,
    document_evidence_count: all.filter((e) => e.source === "document").length,
    activity_evidence_count: all.filter((e) => e.source === "activity").length,
    parsed_at: new Date().toISOString(),
  };
}
