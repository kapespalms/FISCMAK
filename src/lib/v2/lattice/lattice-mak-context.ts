/**
 * Builds a compact lattice summary for injection into Mak's context block.
 *
 * Purpose: give Mak awareness of the physician's top active career lattice areas
 * so it can reference specific evidence IDs when generating documents and connect
 * new captures to existing patterns.
 *
 * Called from chat/message/route.ts context block assembly — must be cheap
 * (no extra DB calls, uses data already available in the chat route).
 *
 * Evidence IDs are included so Mak can cite specific items in document drafts.
 *
 * PRIVACY: never exposes s_index, iwq, cdi scores, or any internal metric.
 * Only cell labels, counts, development levels, energy signals, and raw evidence text.
 */

import type { LatticeDashboardResponse, LatticeGridModel } from "@/lib/v2/lattice/types";
import type { DocumentRecord } from "@/lib/v2/types";
import type { AppUser } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { CareerAssessment } from "@/lib/v2/types";
import { buildLatticeDashboard } from "@/lib/v2/lattice/aggregate";
import { isTraineeCareerLevel } from "@/lib/v2/onboarding-options";

const MAX_TOP_CELLS = 5;
const MAX_SNIPPETS_PER_CELL = 2;
const SNIPPET_CHAR_LIMIT = 90;

function developmentLabel(level: number): string {
  if (level >= 5) return "expert";
  if (level >= 4) return "advanced";
  if (level >= 3) return "independent";
  if (level >= 2) return "developing";
  return "novice";
}

function energyLabel(energizing: number, draining: number): string {
  if (energizing > draining) return "↑ energizing";
  if (draining > energizing) return "↓ draining";
  return "neutral";
}

function formatCellForMak(
  cell: { rowLabel: string; colLabel: string; count: number; maxDevelopmentLevel: number; energizingCount: number; drainingCount: number; evidence: Array<{ id: string; rawText: string }> },
): string {
  const level = `level ${cell.maxDevelopmentLevel} (${developmentLabel(cell.maxDevelopmentLevel)})`;
  const energy = energyLabel(cell.energizingCount, cell.drainingCount);
  const header = `• ${cell.rowLabel} × ${cell.colLabel}: ${cell.count} item${cell.count !== 1 ? "s" : ""}, ${level}, ${energy}`;

  const snippets = cell.evidence.slice(0, MAX_SNIPPETS_PER_CELL).map((e) => {
    const text =
      e.rawText.length > SNIPPET_CHAR_LIMIT
        ? e.rawText.slice(0, SNIPPET_CHAR_LIMIT).trim() + "…"
        : e.rawText.trim();
    return `[${e.id}] ${text}`;
  });

  return snippets.length ? `${header}\n  e.g.: ${snippets.join(" | ")}` : header;
}

/** Format a full lattice grid into a context string for Mak. */
export function buildLatticeMakContext(dashboard: LatticeDashboardResponse | null): string {
  if (!dashboard || dashboard.evidence_total === 0) return "";

  const grid: LatticeGridModel = dashboard.fiscmak;

  const topCells = [...grid.cells]
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_TOP_CELLS);

  if (topCells.length === 0) return "";

  const energizingTotal = grid.cells.reduce((s, c) => s + c.energizingCount, 0);
  const drainingTotal = grid.cells.reduce((s, c) => s + c.drainingCount, 0);

  const lines: string[] = [
    `Career lattice (${dashboard.timeframe}, ${dashboard.evidence_total} evidence items — top active areas):`,
    ...topCells.map(formatCellForMak),
  ];

  if (energizingTotal + drainingTotal > 0) {
    lines.push(`Energy balance: ${energizingTotal} energizing, ${drainingTotal} draining`);
  }

  return lines.join("\n");
}

/**
 * Build a lightweight lattice dashboard for Mak context using data already
 * available in the chat route (docs + metadata). No activities DB fetch needed.
 *
 * Uses the document cache stored in onboarding_metadata to avoid re-parsing CVs.
 */
export function buildLightweightLatticeForMak(input: {
  user: AppUser;
  docs: DocumentRecord[];
  meta: OnboardingMetadata;
  assessments?: CareerAssessment[];
}): LatticeDashboardResponse | null {
  try {
    const { dashboard } = buildLatticeDashboard({
      activities: [], // skip — not available without extra DB call
      documents: input.docs,
      timeframe: "all",
      isTrainee: isTraineeCareerLevel(input.user.career_stage),
      documentCache: (input.meta as Record<string, unknown>).lattice_document_cache as
        | import("@/lib/v2/lattice/document-cache").LatticeDocumentCache
        | undefined,
      scheduleEvents: input.meta.schedule_events ?? [],
      programBlocks: [], // program blocks require initials lookup — skip for Mak context
      user: input.user,
      meta: input.meta,
      assessments: input.assessments,
    });
    return dashboard;
  } catch {
    // Lattice errors must never crash Mak — degrade gracefully.
    return null;
  }
}
