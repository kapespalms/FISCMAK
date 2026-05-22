import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { target_rank, target_track, target_date } = await request.json();
  const dossierId = crypto.randomUUID();
  const now = new Date().toISOString();
  const row = {
    dossier_id: dossierId,
    user_id: auth.userId,
    target_rank: target_rank ?? "Associate Professor",
    target_track: target_track ?? "Clinician-Educator",
    target_date: target_date ?? null,
    narrative_draft: null,
    domain_scores: { teaching: 85, scholarship: 40, clinical: 90, service: 70 },
    gaps_identified: [],
    action_items: [],
    created_at: now,
    last_updated: now,
  };
  if (auth.demo) {
    getServerDemo(auth.userId).dossiers.push(row);
  } else {
    const supabase = await createClient();
    await supabase.from("promotion_dossier").insert(row);
  }
  return jsonOk({ dossier_id: dossierId, initial_assessment: row.domain_scores }, 201);
}
