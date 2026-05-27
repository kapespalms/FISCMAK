import type { ParsedMedhubEvalRow } from "@/lib/v2/gme/medhub-csv-import";
import { parseMedhubCsv } from "@/lib/v2/gme/medhub-csv-import";


function jsonRowToRawRow(row: Record<string, unknown>): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) continue;
    raw[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return raw;
}

export type MedhubSyncResult =
  | { ok: true; rows: ParsedMedhubEvalRow[]; source: "live_api" }
  | { ok: false; reason: string; source: "not_configured" | "fetch_failed" | "parse_failed" };

/** Attempt live MedHub pull when MEDHUB_API_URL + MEDHUB_API_KEY are configured. */
export async function fetchMedhubEvaluationsLive(): Promise<MedhubSyncResult> {
  const baseUrl = process.env.MEDHUB_API_URL?.trim();
  const apiKey = process.env.MEDHUB_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      reason: "MEDHUB_API_URL and MEDHUB_API_KEY not configured.",
      source: "not_configured",
    };
  }

  try {
    const url = baseUrl.endsWith("/evaluations") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/evaluations`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json, text/csv",
      },
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return {
        ok: false,
        reason: `MedHub API returned ${res.status}.`,
        source: "fetch_failed",
      };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("json")) {
      const payload = await res.json();
      const rows = Array.isArray(payload) ? payload : payload?.evaluations;
      if (!Array.isArray(rows) || !rows.length) {
        return { ok: false, reason: "MedHub JSON response had no evaluation rows.", source: "parse_failed" };
      }
      const parsed: ParsedMedhubEvalRow[] = rows.map((row: Record<string, unknown>, i: number) => ({
        eval_id: String(row.eval_id ?? row.id ?? `medhub-live-${i}`),
        form_name: String(row.form_name ?? "medhub_live"),
        form_version: null,
        trainee_initials: row.trainee_initials ? String(row.trainee_initials) : null,
        pgy_level: row.pgy_level ? String(row.pgy_level) : null,
        supervisor_name: row.supervisor_name ? String(row.supervisor_name) : null,
        rotation_name: row.rotation_name ? String(row.rotation_name) : null,
        eval_date: row.eval_date ? String(row.eval_date) : null,
        narrative_text: row.narrative_text ? String(row.narrative_text) : null,
        numeric_scores: (row.numeric_scores ?? {}) as Record<string, number>,
        raw_row: jsonRowToRawRow(row),
      }));
      return { ok: true, rows: parsed, source: "live_api" };
    }

    const csvText = await res.text();
    const { rows } = parseMedhubCsv(csvText);
    if (!rows.length) {
      return { ok: false, reason: "MedHub CSV response parsed zero rows.", source: "parse_failed" };
    }
    return { ok: true, rows, source: "live_api" };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "MedHub fetch failed.",
      source: "fetch_failed",
    };
  }
}
