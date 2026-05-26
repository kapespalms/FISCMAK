import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { dossierLabelForTrack, normalizePromotionTrack } from "@/lib/v2/promotion-narrative-sections";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  if (auth.demo) {
    const d = getServerDemo(auth.userId).dossiers.find((x) => x.dossier_id === id);
    if (!d) return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
    return jsonOk(d);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("promotion_dossier")
    .select("*")
    .eq("dossier_id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (!data) return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
  return jsonOk(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const body = (await request.json()) as {
    target_track?: string;
    target_rank?: string;
    target_date?: string | null;
  };
  const now = new Date().toISOString();
  const trackId = body.target_track ? normalizePromotionTrack(body.target_track) : undefined;
  const targetTrack = trackId ? dossierLabelForTrack(trackId) : body.target_track;

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    const dossier = state.dossiers.find((d) => d.dossier_id === id);
    if (!dossier) return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
    if (targetTrack) dossier.target_track = targetTrack;
    if (body.target_rank) dossier.target_rank = body.target_rank;
    if (body.target_date !== undefined) dossier.target_date = body.target_date;
    dossier.last_updated = now;
    return jsonOk({ dossier, track_id: trackId ?? normalizePromotionTrack(dossier.target_track) });
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("promotion_dossier")
    .select("dossier_id")
    .eq("dossier_id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (!existing) return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);

  const updates: Record<string, unknown> = { last_updated: now };
  if (targetTrack) updates.target_track = targetTrack;
  if (body.target_rank) updates.target_rank = body.target_rank;
  if (body.target_date !== undefined) updates.target_date = body.target_date;

  const { data: dossier } = await supabase
    .from("promotion_dossier")
    .update(updates)
    .eq("dossier_id", id)
    .select("*")
    .single();

  return jsonOk({
    dossier,
    track_id: trackId ?? normalizePromotionTrack(dossier?.target_track),
  });
}
