export const MERGE_FLAG_LABELS: Record<string, string> = {
  possible_duplicate_role: "Two sources may describe the same role — review dates",
  date_conflict: "Conflicting dates found — pick one",
};

export function mergeFlagLabel(flag: string): string {
  return MERGE_FLAG_LABELS[flag] ?? flag.replace(/_/g, " ");
}
