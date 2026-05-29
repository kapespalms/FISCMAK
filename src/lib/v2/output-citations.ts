import type { ConfirmedEvidenceItem } from "@/lib/v2/confirmed-evidence";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace [evidence_id] refs with numbered footnotes and append a Sources block.
 * Phase 2 Output Studio traceability — markdown/HTML safe plain text.
 */
export function appendOutputCitationFootnotes(
  draft: string,
  evidence: ConfirmedEvidenceItem[],
): string {
  if (!draft.trim() || !evidence.length) return draft;

  const idToItem = new Map(evidence.map((item) => [item.evidence_id, item]));
  const ordered: ConfirmedEvidenceItem[] = [];
  const seen = new Set<string>();

  for (const item of evidence) {
    const pattern = new RegExp(`\\[${escapeRegex(item.evidence_id)}\\]`, "g");
    if (pattern.test(draft) && !seen.has(item.evidence_id)) {
      seen.add(item.evidence_id);
      ordered.push(item);
    }
  }

  if (!ordered.length) return draft;

  const numberById = new Map<string, number>();
  ordered.forEach((item, index) => numberById.set(item.evidence_id, index + 1));

  let body = draft;
  for (const [id, num] of numberById) {
    const pattern = new RegExp(`\\[${escapeRegex(id)}\\]`, "g");
    body = body.replace(pattern, `[${num}]`);
  }

  const footnotes = ordered
    .map((item, index) => {
      const when = item.when ? ` · ${item.when}` : "";
      return `[${index + 1}] ${item.sourceLabel}${when} — ${item.text}`;
    })
    .join("\n");

  return `${body.trim()}\n\n---\nSources (confirmed career evidence)\n${footnotes}`;
}
