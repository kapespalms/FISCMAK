/**
 * PHI-safe category summary — shared, dependency-free utility.
 *
 * All capture write paths store the output of makCategorySummary() in raw_text,
 * never the verbatim user input. The verbatim text is read in-memory to classify,
 * then discarded — never persisted.
 *
 * This module deliberately has no local imports so it can be safely used by both
 * activity-capture.ts and its dependencies (FISCMAKClassifier, FreeClassifier)
 * without creating a circular dependency.
 */

/**
 * Builds a controlled-vocabulary category string from classifier output.
 * Example: "psychiatric evaluation · suicidality"
 */
export function makCategorySummary(
  activityKey: string | null | undefined,
  signals: string[],
): string {
  const parts: string[] = [];
  if (activityKey) parts.push(activityKey.replace(/_/g, " "));
  for (const sig of signals.slice(0, 2)) {
    const candidate = sig.replace(/_/g, " ");
    if (!parts.some((p) => p.includes(candidate))) parts.push(candidate);
  }
  return parts.length > 0 ? parts.join(" · ").slice(0, 200) : "professional activity";
}
