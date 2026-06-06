import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { keywordPlacement } from "@/lib/v2/lattice/ontology-bridge";

// 7-day window — weekly pulse
const DUE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ latest: null, due: true });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("weekly_pulse")
    .select("recorded_at, mdt")
    .eq("user_id", auth.userId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const due =
    !data ||
    Date.now() - new Date(data.recorded_at as string).getTime() > DUE_WINDOW_MS;

  return jsonOk({ latest: data ?? null, due });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = (await request.json()) as {
    ee?: number;
    dp?: number;
    qol?: number;
    mdt?: number;
    energy_boost_task?: string | null;
    energy_drain_task?: string | null;
    invisible_flag?: boolean;
  };

  const { ee, dp, qol, mdt, energy_boost_task, energy_drain_task, invisible_flag } = body;

  if (
    !Number.isInteger(ee) || (ee as number) < 0 || (ee as number) > 4 ||
    !Number.isInteger(dp) || (dp as number) < 0 || (dp as number) > 4 ||
    !Number.isInteger(qol) || (qol as number) < 0 || (qol as number) > 4 ||
    !Number.isInteger(mdt) || (mdt as number) < 0 || (mdt as number) > 10
  ) {
    return jsonOk(
      { error: "validation_error", message: "ee/dp/qol must be 0–4; distress must be 0–10." },
      400,
    );
  }

  if (auth.demo) {
    return jsonOk({ saved: true, demo: true, mdt });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("weekly_pulse").insert({
    user_id: auth.userId,
    recorded_at: now,
    ee,
    dp,
    qol,
    mdt,
    energy_boost_task: energy_boost_task ?? null,
    energy_drain_task: energy_drain_task ?? null,
    invisible_flag: invisible_flag ?? false,
  });

  if (error) {
    console.error("[wellbeing/pulse] insert failed:", error.message);
    return jsonOk({ error: "save_error", message: "Could not save pulse check-in." }, 500);
  }

  // B3: Stage pulse free-text to activity_entries for classifier pipeline.
  // Boost = energizing (OI quadrant candidate); drain = draining (SI quadrant candidate).
  const stagingRows: Record<string, unknown>[] = [];
  for (const [text, valence] of [
    [energy_boost_task, "energizing"],
    [energy_drain_task, "draining"],
  ] as [string | null | undefined, string][]) {
    if (!text?.trim()) continue;
    const placement = keywordPlacement(text);
    stagingRows.push({
      id: crypto.randomUUID(),
      user_id: auth.userId,
      created_at: now,
      activity_date: now.slice(0, 10),
      raw_text: text.trim(),
      input_source: "pulse",
      energy_valence: valence,
      primary_domain: placement ? String(placement.domainIndex) : null,
      primary_track: placement ? String(placement.trackIndex) : null,
      primary_domain_confidence: placement ? 0.6 : null,
      primary_track_confidence: placement ? 0.6 : null,
      confidence_score: placement ? 0.6 : 0.3,
    });
  }
  if (stagingRows.length > 0) {
    await supabase.from("activity_entries").insert(stagingRows);
  }

  return jsonOk({ saved: true, recorded_at: now, mdt });
}
