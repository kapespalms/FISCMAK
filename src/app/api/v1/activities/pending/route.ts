/**
 * GET /api/v1/activities/pending
 *
 * Returns unconfirmed activity_entries split by confidence tier for the C1 triage UI.
 * - auto_accept: confidence ≥ 0.80 — pre-approved, shown as a count only
 * - needs_review: confidence < 0.80 — surfaced individually ("ring true?")
 *
 * Excludes CV/document entries (those go through confirm-lines).
 * Caps needs_review at 10 to prevent a 30-row audit-log experience.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export type PendingItem = {
  id: string;
  raw_text: string | null;
  input_source: string | null;
  energy_valence: string | null;
  confidence_score: number | null;
  confidence_tier: "high" | "medium" | "low";
  activity_date: string | null;
  scope: string | null;
};

export type PendingResult = {
  auto_accept: PendingItem[];
  needs_review: PendingItem[];
  total: number;
};

const HIGH_CONFIDENCE = 0.80;

// Capture sources that go through the Mak/pulse pipeline (not CV confirm-lines).
const CAPTURE_SOURCES = [
  "chat",
  "mak_capture",
  "mak_career_item",
  "mak_invisible_energy",
  "mak_patient_care",
  "mak_hours",
  "mak_general",
  "pulse",
];

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ auto_accept: [], needs_review: [], total: 0 } satisfies PendingResult);
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_entries")
    .select(
      "id, raw_text, input_source, energy_valence, confidence_score, activity_date, scope",
    )
    .eq("user_id", auth.userId)
    .or("user_confirmed.eq.false,user_confirmed.is.null")
    .in("input_source", CAPTURE_SOURCES)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return jsonOk({ auto_accept: [], needs_review: [], total: 0 } satisfies PendingResult);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    raw_text: string | null;
    input_source: string | null;
    energy_valence: string | null;
    confidence_score: number | null;
    activity_date: string | null;
    scope: string | null;
  }>;

  const auto_accept: PendingItem[] = [];
  const needs_review: PendingItem[] = [];

  for (const row of rows) {
    const score = typeof row.confidence_score === "number" ? row.confidence_score : 0;
    const tier: PendingItem["confidence_tier"] =
      score >= HIGH_CONFIDENCE ? "high" : score >= 0.60 ? "medium" : "low";

    const item: PendingItem = {
      id:               row.id,
      raw_text:         row.raw_text,
      input_source:     row.input_source,
      energy_valence:   row.energy_valence,
      confidence_score: row.confidence_score,
      confidence_tier:  tier,
      activity_date:    row.activity_date,
      scope:            row.scope,
    };

    if (score >= HIGH_CONFIDENCE) {
      auto_accept.push(item);
    } else if (needs_review.length < 10) {
      needs_review.push(item);
    }
    // Items beyond cap are still counted but not surfaced — they'll appear on the next pass.
  }

  return jsonOk({
    auto_accept,
    needs_review,
    total: rows.length,
  } satisfies PendingResult);
}
