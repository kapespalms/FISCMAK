import {
  assembleFullCareerNarrative,
  buildSectionPrompts,
  careerNarrativeSectionById,
  completionForCareerSection,
  defaultApplicationForStage,
  resolveSectionsForContext,
  normalizeCareerNarrativeStage,
  normalizeCareerNarrativeTrack,
  type CareerNarrativeApplicationId,
  type CareerNarrativeStageId,
  type CareerNarrativeTrackId,
} from "@/lib/v2/career-narrative-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type CareerNarrativeSectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
};

function resolveContext(meta: ReturnType<typeof getOnboardingMetadata>, careerStage?: string | null) {
  const stored = meta.career_narrative;
  const stageId = stored?.stage_id ?? normalizeCareerNarrativeStage(careerStage);
  const trackId = stored?.track_id ?? normalizeCareerNarrativeTrack(meta.promotion_context?.promotion_track);
  const applicationId = stored?.application_id ?? defaultApplicationForStage(stageId);
  return { stageId, trackId, applicationId, sections: stored?.sections ?? {} };
}

function rowsForContext(input: {
  stageId: CareerNarrativeStageId;
  trackId: CareerNarrativeTrackId;
  applicationId: CareerNarrativeApplicationId;
  sections: Record<string, { content?: string; completion_percentage?: number }>;
  specialty?: string | null;
}): CareerNarrativeSectionRow[] {
  return resolveSectionsForContext({
    stageId: input.stageId,
    applicationId: input.applicationId,
  }).map((def) => {
    const saved = input.sections[def.id];
    const content = saved?.content ?? null;
    return {
      section: def.id,
      title: def.title,
      subtitle: def.subtitle,
      target_words: def.targetWords,
      content,
      completion_percentage:
        saved?.completion_percentage ??
        completionForCareerSection(content ?? "", def.targetWords),
      prompts: buildSectionPrompts({
        sectionId: def.id,
        stageId: input.stageId,
        trackId: input.trackId,
        applicationId: input.applicationId,
        specialty: input.specialty,
      }),
    };
  });
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = getOnboardingMetadata(user ?? ({} as import("@/lib/v2/types").AppUser));
  const { stageId, trackId, applicationId, sections } = resolveContext(meta, user?.career_stage);
  const rows = rowsForContext({
    stageId,
    trackId,
    applicationId,
    sections,
    specialty: user?.specialty,
  });
  const overall = rows.length
    ? Math.round(rows.reduce((sum, r) => sum + r.completion_percentage, 0) / rows.length)
    : 0;

  return jsonOk({
    stage_id: stageId,
    track_id: trackId,
    application_id: applicationId,
    sections: rows,
    overall_completion: overall,
    full_draft_preview: assembleFullCareerNarrative(
      stageId,
      rows.map((r) => ({ section: r.section, content: r.content })),
      applicationId,
    ),
    user: {
      specialty: user?.specialty,
      career_stage: user?.career_stage,
      career_objective: meta.career_objective,
    },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = (await request.json()) as {
    stage_id?: CareerNarrativeStageId;
    track_id?: CareerNarrativeTrackId;
    application_id?: CareerNarrativeApplicationId;
  };

  const meta = getOnboardingMetadata(user);
  const current = resolveContext(meta, user.career_stage);
  const next = {
    stage_id: body.stage_id ?? current.stageId,
    track_id: body.track_id ?? current.trackId,
    application_id: body.application_id ?? current.applicationId,
    sections: current.sections,
    updated_at: new Date().toISOString(),
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: { ...meta, career_narrative: next } as Record<string, unknown> },
    auth.demo,
  );

  const rows = rowsForContext({
    stageId: next.stage_id,
    trackId: next.track_id,
    applicationId: next.application_id,
    sections: next.sections,
    specialty: user.specialty,
  });
  return jsonOk({
    stage_id: next.stage_id,
    track_id: next.track_id,
    application_id: next.application_id,
    sections: rows,
    overall_completion: Math.round(
      rows.reduce((sum, r) => sum + r.completion_percentage, 0) / Math.max(rows.length, 1),
    ),
    full_draft_preview: assembleFullCareerNarrative(
      next.stage_id,
      rows.map((r) => ({ section: r.section, content: r.content })),
      next.application_id,
    ),
  });
}
