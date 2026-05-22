import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import {
  completionForSection,
  sectionById,
} from "@/lib/v2/promotion-narrative-sections";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import type { NarrativeProgress } from "@/lib/v2/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { sectionId } = await params;
  const def = sectionById(sectionId);
  if (!def) {
    return jsonOk({ error: "validation_error", message: "Unknown section" }, 400);
  }

  const { dossier_id, content } = await request.json();
  if (!dossier_id) {
    return jsonOk({ error: "validation_error", message: "dossier_id required" }, 400);
  }

  const now = new Date().toISOString();
  const completion = completionForSection(content ?? "", def.targetWords);

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    const dossier = state.dossiers.find((d) => d.dossier_id === dossier_id);
    if (!dossier) {
      return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
    }
    const idx = state.narrativeProgress.findIndex(
      (r) => r.dossier_id === dossier_id && r.section === sectionId,
    );
    const row: NarrativeProgress = {
      progress_id: idx >= 0 ? state.narrativeProgress[idx].progress_id : crypto.randomUUID(),
      dossier_id,
      section: sectionId,
      content: content ?? "",
      completion_percentage: completion,
      mak_feedback: null,
      created_at: idx >= 0 ? state.narrativeProgress[idx].created_at : now,
      last_edited: now,
    };
    if (idx >= 0) state.narrativeProgress[idx] = row;
    else state.narrativeProgress.push(row);
    dossier.last_updated = now;
    return jsonOk({
      section: sectionId,
      content: row.content,
      completion_percentage: completion,
      saved_at: now,
    });
  }

  const supabase = await createClient();
  const { data: dossier } = await supabase
    .from("promotion_dossier")
    .select("dossier_id")
    .eq("dossier_id", dossier_id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (!dossier) {
    return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
  }

  const { data: existing } = await supabase
    .from("narrative_progress")
    .select("progress_id")
    .eq("dossier_id", dossier_id)
    .eq("section", sectionId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("narrative_progress")
      .update({
        content: content ?? "",
        completion_percentage: completion,
        last_edited: now,
      })
      .eq("progress_id", existing.progress_id);
  } else {
    await supabase.from("narrative_progress").insert({
      dossier_id,
      section: sectionId,
      content: content ?? "",
      completion_percentage: completion,
      last_edited: now,
    });
  }

  await supabase
    .from("promotion_dossier")
    .update({ last_updated: now })
    .eq("dossier_id", dossier_id);

  return jsonOk({
    section: sectionId,
    content: content ?? "",
    completion_percentage: completion,
    saved_at: now,
  });
}
