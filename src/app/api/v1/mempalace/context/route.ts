import { fetchLatestMemPalace } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const mp = await fetchLatestMemPalace(auth.userId, auth.demo);
  if (!mp) {
    return jsonOk({
      coaching_summary: "First interaction — no coaching memory yet.",
      key_facts: {},
      preferences: {},
      career_evolution: {},
      last_synced: null,
    });
  }
  return jsonOk({
    coaching_summary: mp.coaching_summary,
    key_facts: mp.key_facts,
    preferences: mp.preferences,
    career_evolution: mp.career_evolution,
    last_synced: mp.created_at,
  });
}
