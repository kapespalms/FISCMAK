import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { itemsToDbRow, type FcwiFrequencyTier } from "@/lib/v2/fcwi";

const VALID_TIERS: FcwiFrequencyTier[] = [
  "onboarding",
  "monthly",
  "quarterly",
  "annual",
  "ad_hoc",
];

// 28-day window — FCWI is a monthly instrument
const DUE_WINDOW_MS = 28 * 24 * 60 * 60 * 1000;

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ latest: null, due: true });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("fcwi_responses")
    .select("recorded_at, frequency_tier")
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
    items?: number[];
    frequency_tier?: string;
  };

  const items = body.items;
  if (!Array.isArray(items) || items.length !== 9) {
    return jsonOk(
      { error: "validation_error", message: "Provide all 9 item responses." },
      400,
    );
  }
  if (items.some((v) => !Number.isInteger(v) || v < 0 || v > 4)) {
    return jsonOk(
      { error: "validation_error", message: "Each item must be 0–4." },
      400,
    );
  }

  const frequency_tier: FcwiFrequencyTier =
    VALID_TIERS.includes(body.frequency_tier as FcwiFrequencyTier)
      ? (body.frequency_tier as FcwiFrequencyTier)
      : "monthly";

  if (auth.demo) {
    return jsonOk({ saved: true, demo: true, frequency_tier });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase.from("fcwi_responses").insert({
    user_id: auth.userId,
    recorded_at: now,
    frequency_tier,
    ...itemsToDbRow(items),
  });

  if (error) {
    console.error("[wellbeing/fcwi] insert failed:", error.message);
    return jsonOk({ error: "save_error", message: "Could not save check-in." }, 500);
  }

  return jsonOk({ saved: true, recorded_at: now, frequency_tier });
}
