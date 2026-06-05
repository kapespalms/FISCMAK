/**
 * GET /api/v1/wellbeing/origami
 *
 * Returns the 7-axis origami plot data + longitudinal trend points.
 *
 * Governance (§C, Part XIX):
 *  - NO composite score is ever returned or computed.
 *  - Instrument names (FCWI, EE, DP, MDT, MBI) never reach the UI via this route.
 *  - MDT ≥ 4 sets mdt_flag; the UI shows a resource link — never auto-reported.
 *  - Physician-owned; no individual data goes to institution-facing surfaces.
 *
 * Data sources:
 *  - Latest fcwi_responses row: item_3 (Meaningfulness), item_6 (Energy),
 *    item_7 (Recognition), item_9 (Self-Care)
 *  - Latest + last 16 weekly_pulse rows: ee, dp, qol, mdt
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

// ---------------------------------------------------------------------------
// Types (exported for component use)
// ---------------------------------------------------------------------------

export type OrigamiAxisData = {
  /** Physician-facing plain-language label. No instrument names. */
  label:      string;
  /** Normalized value 0–1. null = no data yet for this axis. */
  normalized: number | null;
  /** Threshold position 0–1 (where the meaningful boundary sits on this axis). */
  threshold:  number;
  /** lower_better: high values signal concern. higher_better: high values are positive. */
  direction:  "lower_better" | "higher_better";
};

export type TrendPoint = {
  recorded_at: string;
  /** null if not recorded that week */
  ee:  number | null;
  dp:  number | null;
  qol: number | null;
  mdt: number | null;
};

export type OrigamiResult = {
  /** 7 axes in display order. */
  axes:        OrigamiAxisData[];
  /** true when latest mdt ≥ 4 (0–10 scale). UI must surface a resource link. */
  mdt_flag:    boolean;
  /** true when at least one axis has a data value. */
  has_data:    boolean;
  /** true when FCWI data is available (drives 4 of 7 axes). */
  has_fcwi:    boolean;
  /** true when pulse data is available (drives 3 of 7 axes). */
  has_pulse:   boolean;
  /** Up to 16 most-recent weekly pulse points for trend sparklines. */
  trends:      TrendPoint[];
  /** Plain-language coaching summary. Null when no data. */
  summary:     string | null;
};

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

function norm04(v: number): number {
  return Math.min(1, Math.max(0, v / 4));
}
function norm010(v: number): number {
  return Math.min(1, Math.max(0, v / 10));
}

// ---------------------------------------------------------------------------
// Plain-language summary (governance: "Some responses suggest…" framing)
// No instrument names, no raw scores, no composite label.
// ---------------------------------------------------------------------------

function buildSummary(
  axes: OrigamiAxisData[],
  mdt_flag: boolean,
): string | null {
  if (!axes.some((a) => a.normalized !== null)) return null;

  if (mdt_flag) {
    return "Some responses suggest you may benefit from speaking with a colleague or wellness resource.";
  }

  const eeAxis = axes.find((a) => a.label === "Feeling depleted by work");
  const dpAxis = axes.find((a) => a.label === "Feeling disconnected");

  const depleted =
    eeAxis?.normalized != null && eeAxis.normalized >= eeAxis.threshold;
  const disconnected =
    dpAxis?.normalized != null && dpAxis.normalized >= dpAxis.threshold;

  if (depleted && disconnected) {
    return "Some responses suggest significant work demands are taking a toll. Connecting with what restores your energy may help.";
  }
  if (depleted || disconnected) {
    return "Some responses suggest work may be feeling draining right now. It's worth checking in with yourself about what would help.";
  }

  const positiveAxes = axes.filter((a) => a.direction === "higher_better" && a.normalized !== null);
  const belowThreshold = positiveAxes.filter((a) => a.normalized! < a.threshold);

  if (belowThreshold.length >= 3) {
    return "Some patterns suggest this might be a good time to reconnect with what gives your work meaning.";
  }

  const allPositiveAbove = positiveAxes.length > 0 && belowThreshold.length === 0;
  if (allPositiveAbove) {
    return "Your responses suggest a generally positive relationship with your work right now.";
  }

  return "Your responses offer a picture of your well-being across several dimensions.";
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  // Demo state: return empty scaffold so UI renders correctly
  if (auth.demo) {
    const axes: OrigamiAxisData[] = [
      { label: "Feeling depleted by work",     normalized: null, threshold: 0.75, direction: "lower_better"  },
      { label: "Feeling disconnected",          normalized: null, threshold: 0.75, direction: "lower_better"  },
      { label: "Meaning in your work",          normalized: null, threshold: 0.625, direction: "higher_better" },
      { label: "Moral distress",                normalized: null, threshold: 0.40,  direction: "lower_better"  },
      { label: "What energizes you",            normalized: null, threshold: 0.625, direction: "higher_better" },
      { label: "Feeling recognized",            normalized: null, threshold: 0.625, direction: "higher_better" },
      { label: "Prioritizing your well-being",  normalized: null, threshold: 0.625, direction: "higher_better" },
    ];
    return jsonOk({ axes, mdt_flag: false, has_data: false, has_fcwi: false, has_pulse: false, trends: [], summary: null } satisfies OrigamiResult);
  }

  const supabase = await createClient();

  // Fetch latest FCWI response
  const { data: fcwi } = await supabase
    .from("fcwi_responses")
    .select("item_3, item_6, item_7, item_9, recorded_at")
    .eq("user_id", auth.userId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch latest weekly pulse (for current origami values)
  const { data: pulse } = await supabase
    .from("weekly_pulse")
    .select("ee, dp, qol, mdt, recorded_at")
    .eq("user_id", auth.userId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch trend history (last 16 weeks)
  const { data: trendRows } = await supabase
    .from("weekly_pulse")
    .select("ee, dp, qol, mdt, recorded_at")
    .eq("user_id", auth.userId)
    .order("recorded_at", { ascending: false })
    .limit(16);

  const has_pulse = !!pulse;
  const has_fcwi  = !!fcwi;

  const mdtRaw = pulse ? (pulse.mdt as number) : null;
  const mdt_flag = mdtRaw != null && mdtRaw >= 4;

  // Build 7 axes — order matters for display
  const axes: OrigamiAxisData[] = [
    {
      label:      "Feeling depleted by work",
      normalized: pulse ? norm04(pulse.ee as number) : null,
      threshold:  0.75,    // concern: "often" (3/4) or above
      direction:  "lower_better",
    },
    {
      label:      "Feeling disconnected",
      normalized: pulse ? norm04(pulse.dp as number) : null,
      threshold:  0.75,
      direction:  "lower_better",
    },
    {
      label:      "Meaning in your work",
      normalized: fcwi ? norm04(fcwi.item_3 as number) : null,
      threshold:  0.625,   // positive zone: agree (3/4) or above
      direction:  "higher_better",
    },
    {
      label:      "Moral distress",
      normalized: pulse ? norm010(mdtRaw!) : null,
      threshold:  0.40,    // trigger: 4/10
      direction:  "lower_better",
    },
    {
      label:      "What energizes you",
      normalized: fcwi ? norm04(fcwi.item_6 as number) : null,
      threshold:  0.625,
      direction:  "higher_better",
    },
    {
      label:      "Feeling recognized",
      normalized: fcwi ? norm04(fcwi.item_7 as number) : null,
      threshold:  0.625,
      direction:  "higher_better",
    },
    {
      label:      "Prioritizing your well-being",
      normalized: fcwi ? norm04(fcwi.item_9 as number) : null,
      threshold:  0.625,
      direction:  "higher_better",
    },
  ];

  const has_data = axes.some((a) => a.normalized !== null);

  const trends: TrendPoint[] = (trendRows ?? [])
    .slice()
    .reverse()
    .map((r) => ({
      recorded_at: r.recorded_at as string,
      ee:  r.ee  != null ? (r.ee  as number) : null,
      dp:  r.dp  != null ? (r.dp  as number) : null,
      qol: r.qol != null ? (r.qol as number) : null,
      mdt: r.mdt != null ? (r.mdt as number) : null,
    }));

  const summary = buildSummary(axes, mdt_flag);

  return jsonOk({ axes, mdt_flag, has_data, has_fcwi, has_pulse, trends, summary } satisfies OrigamiResult);
}
