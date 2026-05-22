import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import {
  assembleFullNarrative,
  PROMOTION_NARRATIVE_SECTIONS,
} from "@/lib/v2/promotion-narrative-sections";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import type { NarrativeProgress, PromotionDossier } from "@/lib/v2/types";

function sectionsForDossier(
  dossierId: string,
  rows: NarrativeProgress[],
) {
  return PROMOTION_NARRATIVE_SECTIONS.map((def) => {
    const row = rows.find((r) => r.dossier_id === dossierId && r.section === def.id);
    return {
      section: def.id,
      title: def.title,
      subtitle: def.subtitle,
      target_words: def.targetWords,
      content: row?.content ?? null,
      completion_percentage: row?.completion_percentage ?? 0,
      last_edited: row?.last_edited ?? null,
    };
  });
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const readiness = {
    target_rank: "Associate Professor",
    target_track: "Clinician-Educator",
  };

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    let dossier = state.dossiers[state.dossiers.length - 1];
    if (!dossier) {
      const now = new Date().toISOString();
      dossier = {
        dossier_id: crypto.randomUUID(),
        user_id: auth.userId,
        target_rank: readiness.target_rank,
        target_track: readiness.target_track,
        target_date: null,
        narrative_draft: null,
        domain_scores: { teaching: 85, scholarship: 40, clinical: 90, service: 70 },
        gaps_identified: [],
        action_items: [],
        created_at: now,
        last_updated: now,
      };
      state.dossiers.push(dossier);
    }
    const sections = sectionsForDossier(dossier.dossier_id, state.narrativeProgress);
    const overall = Math.round(
      sections.reduce((sum, s) => sum + s.completion_percentage, 0) / sections.length,
    );
    return jsonOk({
      dossier,
      sections,
      overall_completion: overall,
      full_draft_preview: assembleFullNarrative(sections),
      user: {
        specialty: user?.specialty,
        career_stage: user?.career_stage,
      },
    });
  }

  const supabase = await createClient();
  let { data: dossier } = await supabase
    .from("promotion_dossier")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!dossier) {
    const now = new Date().toISOString();
    const { data: created } = await supabase
      .from("promotion_dossier")
      .insert({
        user_id: auth.userId,
        target_rank: readiness.target_rank,
        target_track: readiness.target_track,
        domain_scores: { teaching: 85, scholarship: 40, clinical: 90, service: 70 },
        last_updated: now,
      })
      .select("*")
      .single();
    dossier = created as PromotionDossier;
  }

  const { data: progress } = await supabase
    .from("narrative_progress")
    .select("*")
    .eq("dossier_id", dossier.dossier_id);

  const sections = sectionsForDossier(
    dossier.dossier_id,
    (progress ?? []) as NarrativeProgress[],
  );
  const overall = Math.round(
    sections.reduce((sum, s) => sum + s.completion_percentage, 0) / sections.length,
  );

  return jsonOk({
    dossier,
    sections,
    overall_completion: overall,
    full_draft_preview: assembleFullNarrative(sections),
    user: {
      specialty: user?.specialty,
      career_stage: user?.career_stage,
    },
  });
}
