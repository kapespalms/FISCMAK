/** Title-case specialty labels for UI display (ACGME seed data uses sentence case). */

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "for",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

const ACRONYMS = new Set(["ED", "IM", "VA", "UH", "MPU", "CL", "MAT", "QI", "MRI", "HIV"]);

function capitalizeToken(token: string, index: number, isLast: boolean): string {
  if (!token) return token;
  if (ACRONYMS.has(token.toUpperCase())) return token.toUpperCase();
  const lower = token.toLowerCase();
  if (index > 0 && !isLast && SMALL_WORDS.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Display label — preserves slashes and en-dashes, title-cases words. */
export function formatSpecialtyDisplayLabel(name: string): string {
  if (!name.trim()) return name;
  return name
    .split(/(\s+|\/|–|-)/)
    .map((part, index, parts) => {
      if (/^[\s/–-]+$/.test(part)) return part;
      const wordIndex = parts.slice(0, index).filter((p) => !/^[\s/–-]+$/.test(p)).length;
      const words = parts.filter((p) => !/^[\s/–-]+$/.test(p));
      const isLast = wordIndex === words.length - 1;
      return capitalizeToken(part, wordIndex, isLast);
    })
    .join("");
}
