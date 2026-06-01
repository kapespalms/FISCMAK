import { createClient } from "@/lib/supabase/server";
import { getAppUser, isErrorResponse, jsonOk, requireApiUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { lookupNaicsCode, isValidClinicalSetting } from "@/lib/v2/setting-naics-map";
import { isValidPracticeSetting } from "@/lib/v2/onboarding-options";

// 90-day window for quarterly snapshot
const DUE_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ due: true, last_completed: null, energy_rankings: [], goals: [], fte_expected: null, practice_setting: null, clinical_setting: null });
  }

  const supabase = await createClient();
  const user = await getAppUser(auth.userId, auth.demo);
  const meta = user ? getOnboardingMetadata(user) : {};
  const lastCompleted = (meta as Record<string, unknown>).quarterly_snapshot_completed_at as string | null ?? null;
  const due = !lastCompleted || Date.now() - new Date(lastCompleted).getTime() > DUE_WINDOW_MS;

  const { data: rankings } = await supabase
    .from("energy_rankings")
    .select("domain_index, rank")
    .eq("user_id", auth.userId)
    .order("domain_index");

  // goal_records may not exist yet — fail gracefully
  let goals: unknown[] = [];
  try {
    const { data } = await supabase
      .from("goal_records")
      .select("id, horizon, framework, specific, wish")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(10);
    goals = data ?? [];
  } catch {
    goals = [];
  }

  return jsonOk({
    due,
    last_completed: lastCompleted,
    energy_rankings: rankings ?? [],
    goals,
    fte_expected: user?.fte_expected ?? null,
    practice_setting: user?.practice_setting ?? null,
    clinical_setting: (meta as Record<string, unknown>).clinical_setting as string | null ?? null,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = (await request.json()) as {
    energy_rankings?: { domain_index: number; rank: number }[];
    fte_expected?: Record<string, number> | null;
    goal_note?: string | null;
    practice_setting?: string | null;
    clinical_setting?: string | null;
  };

  if (auth.demo) {
    return jsonOk({ saved: true, demo: true });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Upsert energy rankings
  if (body.energy_rankings?.length) {
    const invalid = body.energy_rankings.find(
      (r) => r.domain_index < 0 || r.domain_index > 7 || r.rank < 1 || r.rank > 5,
    );
    if (!invalid) {
      const rows = body.energy_rankings.map(({ domain_index, rank }) => ({
        user_id: auth.userId,
        domain_index,
        rank,
        updated_at: now,
      }));
      await supabase.from("energy_rankings").upsert(rows, { onConflict: "user_id,domain_index" });
    }
  }

  // 2 + 4. Patch app_users (FTE + setting)
  const user = await getAppUser(auth.userId, auth.demo);
  const meta = user ? getOnboardingMetadata(user) : {};

  const settingPatch: Record<string, unknown> = {};
  if (body.fte_expected != null) settingPatch.fte_expected = body.fte_expected;
  if (body.practice_setting && isValidPracticeSetting(body.practice_setting)) {
    settingPatch.practice_setting = body.practice_setting;
  }

  const updatedMeta: Record<string, unknown> = {
    ...(meta as Record<string, unknown>),
    quarterly_snapshot_completed_at: now,
    ...(body.goal_note?.trim() ? { quarterly_goal_note: body.goal_note.trim() } : {}),
    ...(body.practice_setting ? { naics_code: lookupNaicsCode(body.practice_setting) } : {}),
    ...(body.clinical_setting && isValidClinicalSetting(body.clinical_setting)
      ? { clinical_setting: body.clinical_setting }
      : {}),
  };

  await upsertAppUser(
    auth.userId,
    auth.email ?? "",
    { ...settingPatch, onboarding_metadata: updatedMeta },
    false,
  );

  return jsonOk({ saved: true, completed_at: now });
}
