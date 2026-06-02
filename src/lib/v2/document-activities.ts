/**
 * CV-pipeline plumbing — new evidence model (BUILD_ORDER 4.1 §8.2).
 *
 * Seeder: parsed CV rows → activity_entries staging layer.
 *   - One row per snippet; multi-cell distribution packed into mak_rationale.
 *   - CV = OV/SV only; no OI/SI written here.
 *   - Gracefully skips if migration 20260552 (source_document_id / user_confirmed)
 *     hasn't been applied yet.
 *
 * Confirm helper (consumed by the confirm-lines route):
 *   - Unpacks stored cell distribution from mak_rationale.
 *   - Applies physician overrides.
 */

import { createClient } from "@/lib/supabase/server";
import { CAREER_DOMAINS } from "@/lib/v2/domains";
import {
  parseDocumentToCvRows,
  type CvCellWeight,
} from "@/lib/v2/lattice/document-parser";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const TRACK_NAMES = [
  "Clinician", "Educator", "Researcher", "Leader",
  "Advocate", "Innovator", "Quality-Safety", "Wellness Champion",
] as const;

function domainName(i: number): string {
  return CAREER_DOMAINS.find((d) => d.index === i)?.name ?? `domain_${i}`;
}
function trackName(i: number): string {
  return TRACK_NAMES[i] ?? `track_${i}`;
}
function confidenceTier(score: number): string {
  return score >= 0.80 ? "high" : score >= 0.60 ? "medium" : "low";
}

/** Compact serialization stored in mak_rationale so the confirm route can
 *  reconstruct the full cell distribution without re-running the parser. */
type PackedCell = { d: number; t: number; w: number; q: string };

function packCells(cells: CvCellWeight[]): string {
  const packed: PackedCell[] = cells.map(({ domain_index, track_index, weight, quadrant }) => ({
    d: domain_index, t: track_index, w: weight, q: quadrant,
  }));
  return JSON.stringify({ cv_cells: packed });
}

export function unpackCells(mak_rationale: string | null): CvCellWeight[] {
  if (!mak_rationale) return [];
  try {
    const parsed = JSON.parse(mak_rationale) as { cv_cells?: PackedCell[] };
    return (parsed.cv_cells ?? []).map(({ d, t, w, q }) => ({
      domain_index: d,
      track_index:  t,
      weight:       w,
      quadrant:     (q === "OV" || q === "SV") ? q : "OV",
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Pass 2: seed activity_entries from parsed CV
// ---------------------------------------------------------------------------

/**
 * Parse a CV document's extracted text and insert one activity_entries staging
 * row per classified snippet. All rows: user_confirmed = false, input_source =
 * "cv_document". Multi-cell distribution is packed into mak_rationale so the
 * confirm endpoint can create evidence_unit + evidence_cell_weights without
 * re-running the parser.
 *
 * Returns count of rows inserted (0 on failure, non-CV, or demo mode).
 */
export async function seedActivityEntriesFromCv(params: {
  userId: string;
  documentId: string;
  documentType: string;
  extractedText: string;
  demo: boolean;
}): Promise<number> {
  if (params.documentType !== "CV") return 0;
  if (!params.extractedText?.trim()) return 0;
  if (params.demo) return 0;

  const parsedRows = parseDocumentToCvRows(params.extractedText);
  if (parsedRows.length === 0) return 0;

  const today = new Date().toISOString().slice(0, 10);

  const activityRows = parsedRows.map((row) => {
    const primary = row.cells[0]!; // highest-weight cell
    return {
      user_id:                   params.userId,
      activity_date:             today,
      raw_text:                  row.raw_text,
      input_source:              "cv_document",
      primary_domain:            domainName(primary.domain_index),
      primary_track:             trackName(primary.track_index),
      confidence_score:          row.confidence_score,
      primary_domain_confidence: row.confidence_score,
      primary_track_confidence:  row.confidence_score,
      evidence_strength:         confidenceTier(row.confidence_score),
      recognition_quadrant:      primary.quadrant,     // OV (v3 column, 20260536)
      source_document_id:        params.documentId,    // new column (20260552)
      user_confirmed:            false,                // new column (20260552)
      // STAGING-ONLY: mak_rationale holds the packed multi-cell distribution
      // until the physician confirms. At confirm time the distribution is
      // promoted to evidence_cell_weights rows and this field is no longer read.
      // Nothing else reads mak_rationale for input_source='cv_document' rows.
      mak_rationale: packCells(row.cells),
    };
  });

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("activity_entries").insert(activityRows);
    if (error) {
      // Gracefully handle case where 20260552 not yet applied
      console.warn("[document-activities] seed skipped:", error.message);
      return 0;
    }
    return activityRows.length;
  } catch (e) {
    console.warn("[document-activities] seed error:", e);
    return 0;
  }
}
