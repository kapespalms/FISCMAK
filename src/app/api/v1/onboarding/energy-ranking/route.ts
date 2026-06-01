import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

type RankingEntry = { domain_index: number; rank: number };

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { rankings } = (await request.json()) as { rankings?: RankingEntry[] };

  if (!Array.isArray(rankings) || rankings.length === 0) {
    return jsonOk({ error: "validation_error", message: "Provide at least one domain ranking." }, 400);
  }

  const invalid = rankings.find(
    (r) =>
      !Number.isInteger(r.domain_index) ||
      r.domain_index < 0 ||
      r.domain_index > 7 ||
      !Number.isInteger(r.rank) ||
      r.rank < 1 ||
      r.rank > 5,
  );
  if (invalid) {
    return jsonOk(
      { error: "validation_error", message: "domain_index must be 0–7; rank must be 1–5." },
      400,
    );
  }

  if (auth.demo) {
    return jsonOk({ saved: rankings.length, demo: true });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const rows = rankings.map(({ domain_index, rank }) => ({
    user_id: auth.userId,
    domain_index,
    rank,
    updated_at: now,
  }));

  const { error } = await supabase
    .from("energy_rankings")
    .upsert(rows, { onConflict: "user_id,domain_index" });

  if (error) {
    console.error("[energy-ranking] upsert failed:", error.message);
    return jsonOk({ error: "save_error", message: "Could not save energy rankings." }, 500);
  }

  return jsonOk({ saved: rows.length, saved_at: now });
}
