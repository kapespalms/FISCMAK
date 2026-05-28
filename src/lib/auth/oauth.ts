/** OAuth redirect helpers for Supabase Auth (Google, Apple, etc.) */

const DEFAULT_NEXT = "/app/onboarding";
const CANONICAL_APP_ORIGIN = "https://www.fiscmak.com";

/** Production app origin — prefer env, then canonical www host. */
export function getAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "fiscmak.com" || hostname === "www.fiscmak.com") {
      return CANONICAL_APP_ORIGIN;
    }
    return origin;
  }
  return CANONICAL_APP_ORIGIN;
}

/** Full-page navigation to an internal app path on the canonical origin. */
export function navigateToAppPath(path: string) {
  if (typeof window === "undefined") return;
  const safe = sanitizeNextPath(path);
  const origin = getAppOrigin();
  window.location.assign(`${origin}${safe}`);
}

/** Safe internal path only — blocks open redirects. */
export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return DEFAULT_NEXT;
  }
  return next;
}

/** Read invite token from a relative app path (e.g. /app/onboarding?token=…). */
export function extractInviteTokenFromPath(path: string): string | null {
  try {
    const url = new URL(path, "http://local");
    return url.searchParams.get("token");
  } catch {
    return null;
  }
}

/** Merge optional invite token into onboarding next path. */
export function onboardingPathWithOptionalToken(
  next: string,
  token: string | null | undefined,
): string {
  const trimmed = token?.trim();
  if (!trimmed) return sanitizeNextPath(next);

  try {
    const url = new URL(sanitizeNextPath(next), "http://local");
    if (!url.pathname.startsWith("/app/onboarding")) {
      return `/app/onboarding?token=${encodeURIComponent(trimmed)}`;
    }
    if (!url.searchParams.get("token")) {
      url.searchParams.set("token", trimmed);
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return `/app/onboarding?token=${encodeURIComponent(trimmed)}`;
  }
}

/** Remember invite/program onboarding entry across auth redirects. */
export function rememberOnboardingNextPath(next: string) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(next, window.location.origin);
    if (!url.pathname.startsWith("/app/onboarding")) return;
    const params = url.searchParams;
    if (params.get("token") || params.get("program") || params.get("path") === "public") {
      sessionStorage.setItem("fiscmak_onboarding_next", `${url.pathname}${url.search}`);
    }
  } catch {
    /* ignore malformed next paths */
  }
}

/** Callback URL passed to Supabase signInWithOAuth redirectTo. */
export function getAuthCallbackUrl(next: string, origin?: string): string {
  const base = origin ?? getAppOrigin();
  const safeNext = sanitizeNextPath(next);
  return `${base}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

export function displayNameFromAuthUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): string | null {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  if (fromMeta) return fromMeta;
  if (user.email) return user.email.split("@")[0] ?? null;
  return null;
}
