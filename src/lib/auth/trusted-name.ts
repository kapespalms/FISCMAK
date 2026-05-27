/** Name values we trust to pre-fill (OAuth or prior saved profile — not email-derived guesses). */

export type TrustedName = {
  first: string;
  last: string;
  source: "oauth" | "profile" | "app_user" | null;
};

export function splitTrustedName(full: string | null | undefined): { first: string; last: string } {
  if (!full?.trim()) return { first: "", last: "" };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function trustedNameFromOAuthMetadata(
  meta: Record<string, unknown> | null | undefined,
): TrustedName | null {
  if (!meta) return null;
  const full =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (full) {
    const { first, last } = splitTrustedName(full);
    if (first) return { first, last, source: "oauth" };
  }
  const given = typeof meta.given_name === "string" ? meta.given_name.trim() : "";
  const family = typeof meta.family_name === "string" ? meta.family_name.trim() : "";
  if (given) return { first: given, last: family, source: "oauth" };
  return null;
}

export function combineName(first: string, last: string): string {
  return [first.trim(), last.trim()].filter(Boolean).join(" ");
}
