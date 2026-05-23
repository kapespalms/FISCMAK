import type { AnalyticsDashboard } from "@/lib/v2/types";
import type { AnnualRefreshStatus } from "@/lib/v2/annual-refresh";
import type { QuarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";

export type TouchpointFetchResult = {
  analytics: AnalyticsDashboard | null;
  apiAvailable: boolean;
  error: string | null;
};

async function readJson<T>(res: Response): Promise<T | null> {
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Load dashboard + touchpoint status; detects stale/missing API routes. */
export async function fetchDashboardWithTouchpoints(): Promise<TouchpointFetchResult> {
  const [dashRes, annualRes, quarterlyRes] = await Promise.all([
    fetch("/api/v1/analytics/dashboard"),
    fetch("/api/v1/touchpoints/annual"),
    fetch("/api/v1/touchpoints/quarterly"),
  ]);

  const touchpointRoutesAvailable = annualRes.ok && quarterlyRes.ok;
  if (!dashRes.ok) {
    const err = await readJson<{ message?: string; error?: string }>(dashRes);
    return {
      analytics: null,
      apiAvailable: touchpointRoutesAvailable,
      error: err?.message ?? err?.error ?? "Could not load dashboard",
    };
  }

  const data = (await readJson<AnalyticsDashboard>(dashRes)) ?? null;
  if (!data) {
    return {
      analytics: null,
      apiAvailable: false,
      error: "Dashboard returned an invalid response — restart the dev server.",
    };
  }

  if (!data.annual_refresh && annualRes.ok) {
    data.annual_refresh = (await readJson<AnnualRefreshStatus>(annualRes)) ?? null;
  }
  if (!data.quarterly_pulse && quarterlyRes.ok) {
    data.quarterly_pulse = (await readJson<QuarterlyPulseStatus>(quarterlyRes)) ?? null;
  }

  if (!touchpointRoutesAvailable) {
    return {
      analytics: data,
      apiAvailable: false,
      error:
        "Annual refresh API is unavailable. Stop the old dev server and run: npm run dev",
    };
  }

  return { analytics: data, apiAvailable: true, error: null };
}

export async function postTouchpointJson<T>(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    return {
      ok: false,
      data: null,
      error: "Touchpoint API unavailable — restart the dev server (npm run dev).",
    };
  }
  const data = (await res.json()) as T & { message?: string; error?: string };
  if (!res.ok) {
    return {
      ok: false,
      data: null,
      error: data.message ?? data.error ?? "Request failed",
    };
  }
  return { ok: true, data, error: null };
}
