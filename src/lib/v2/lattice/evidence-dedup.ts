import type { LatticeEvidence, LatticeEvidenceSource } from "@/lib/v2/lattice/types";

/** Higher = preferred when the same theme appears in multiple sources. */
const SOURCE_PRIORITY: Record<LatticeEvidenceSource, number> = {
  activity: 6,
  rotation: 5,
  document: 4,
  schedule: 3,
  assessment: 2,
  goal: 2,
  profile: 1,
};

export function latticeEvidenceDedupKey(e: LatticeEvidence): string {
  const month = e.date?.slice(0, 7) ?? "unknown";
  const d = e.fiscmak?.domainIndex ?? -1;
  const t = e.fiscmak?.trackIndex ?? -1;
  const a = e.acgme?.competencyKey ?? "none";
  return `${d}:${t}:${a}:${month}`;
}

export function dedupeLatticeEvidence(evidence: LatticeEvidence[]): {
  deduped: LatticeEvidence[];
  rawCount: number;
  dedupedCount: number;
} {
  const rawCount = evidence.length;
  const groups = new Map<string, LatticeEvidence>();

  for (const item of evidence) {
    const key = latticeEvidenceDedupKey(item);
    const existing = groups.get(key);
    if (
      !existing ||
      SOURCE_PRIORITY[item.source] > SOURCE_PRIORITY[existing.source] ||
      (SOURCE_PRIORITY[item.source] === SOURCE_PRIORITY[existing.source] &&
        item.developmentLevel > existing.developmentLevel)
    ) {
      groups.set(key, item);
    }
  }

  const deduped = [...groups.values()];
  return { deduped, rawCount, dedupedCount: deduped.length };
}
