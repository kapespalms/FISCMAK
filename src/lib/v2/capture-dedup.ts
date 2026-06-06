/**
 * B5: Dedup/merge — prevent the same accomplishment from being staged twice.
 *
 * Strategy: a new capture is a near-duplicate if:
 *   (a) its normalized text shares ≥ 60% word overlap with an existing staging row, OR
 *   (b) its activity_key + primary_domain match AND the existing row is < 30 days old.
 *
 * This runs against activity_entries (staging), not evidence_unit (confirmed).
 * Confirmed items are protected by the confirmation gate in Phase C.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityEntry } from "@/lib/types/database";

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const DEDUP_WINDOW_DAYS = 30;
const TEXT_SIMILARITY_THRESHOLD = 0.6;

export type DedupCandidate = {
  rawText: string;
  activityKey?: string | null;
  primaryDomain?: string | null;
};

export async function isDuplicate(
  supabase: SupabaseClient,
  userId: string,
  candidate: DedupCandidate,
): Promise<{ duplicate: boolean; matchId?: string }> {
  const windowStart = new Date(Date.now() - DEDUP_WINDOW_DAYS * 86400_000).toISOString();

  const { data: recent } = await supabase
    .from("activity_entries")
    .select("id, raw_text, primary_domain")
    .eq("user_id", userId)
    .gte("created_at", windowStart)
    .in("input_source", ["mak_career_item", "mak_invisible_energy", "mak_patient_care", "pulse", "assessment"])
    .limit(50);

  if (!recent?.length) return { duplicate: false };

  const candidateTokens = tokenize(candidate.rawText);

  for (const row of recent as ActivityEntry[]) {
    if (!row.raw_text) continue;

    // Text similarity check
    const rowTokens = tokenize(row.raw_text);
    if (jaccardSimilarity(candidateTokens, rowTokens) >= TEXT_SIMILARITY_THRESHOLD) {
      return { duplicate: true, matchId: row.id };
    }

    // Key + domain match (cheaper, catches same-type recaptures)
    if (
      candidate.activityKey &&
      candidate.primaryDomain &&
      row.primary_domain === candidate.primaryDomain &&
      row.raw_text.toLowerCase().includes(candidate.activityKey.toLowerCase())
    ) {
      return { duplicate: true, matchId: row.id };
    }
  }

  return { duplicate: false };
}
