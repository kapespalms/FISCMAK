import { formatSpecialtyDisplayLabel } from "@/lib/v2/specialty-display-label";

/** Normalize free-text tags (industries, extracurriculars, custom specialties). */
export function normalizeTagLabel(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return formatSpecialtyDisplayLabel(trimmed);
}

export function tagMatchesQuery(tag: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return tag.toLowerCase().includes(q);
}
