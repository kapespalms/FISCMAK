import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { keywordPlacement } from "@/lib/v2/lattice/ontology-bridge";
import { stripPhi } from "@/lib/v2/phi-strip";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

const MDT_PHQ2_THRESHOLD = 4;

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
  // B1: Strip PHI before staging — free-text is the highest PHI-leak surface.
  const stagingRows: Record<string, unknown>[] = [];
  for (const [rawText, valence] of [
    [energy_boost_task, "energizing"],
    [energy_drain_task, "draining"],
  ] as [string | null | undefined, string][]) {
    if (!rawText?.trim()) continue;
    const text = stripPhi(rawText).scrubbed;
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

  // 6.4: MDT ≥ 4 → queue PHQ-2 for the next Mak session (triggered follow-up only).
  // PHQ-2 is NOT a universal screen — never fires at Day-0.
  // Wires the gap noted in instrument-conversation-service.ts:
  //   "MDT ≥ 4 trigger requires a weekly_pulse query — handled separately."
  const mdtValue = mdt as number;
  if (mdtValue >= MDT_PHQ2_THRESHOLD) {
    try {
      const user = await getAppUser(auth.userId, false);
      if (user) {
        const meta = getOnboardingMetadata(user);
        const existingIds: string[] = meta.instrument_ids ?? [];
        if (!existingIds.includes("phq2")) {
          await upsertAppUser(auth.userId, auth.email, {
            onboarding_metadata: {
              ...(user.onboarding_metadata ?? {}),
              instrument_ids: [...existingIds, "phq2"],
            } as Record<string, unknown>,
          }, false);
        }
      }
    } catch (e) {
      // Non-fatal — PHQ-2 queueing failure should not block pulse save
      console.warn("[pulse] MDT→PHQ-2 queue failed:", e);
    }
  }

  return jsonOk({ saved: true, recorded_at: now, mdt });
}
