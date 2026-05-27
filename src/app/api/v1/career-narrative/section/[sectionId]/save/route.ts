import {
  careerNarrativeSectionById,
  completionForCareerSection,
  defaultApplicationForStage,
  normalizeCareerNarrativeStage,
  normalizeCareerNarrativeTrack,
} from "@/lib/v2/career-narrative-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { sectionId } = await params;
  const def = careerNarrativeSectionById(sectionId);
  if (!def) {
    return jsonOk({ error: "validation_error", message: "Unknown section" }, 400);
  }

  const { content } = await request.json();
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const stored = meta.career_narrative;
  const stageId = stored?.stage_id ?? normalizeCareerNarrativeStage(user.career_stage);
  const trackId = stored?.track_id ?? normalizeCareerNarrativeTrack(meta.promotion_context?.promotion_track);
  const applicationId = stored?.application_id ?? defaultApplicationForStage(stageId);
  const now = new Date().toISOString();
  const completion = completionForCareerSection(content ?? "", def.targetWords);

  const nextSections = {
    ...(stored?.sections ?? {}),
    [sectionId]: {
      content: content ?? "",
      completion_percentage: completion,
      last_edited: now,
    },
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        career_narrative: {
          stage_id: stageId,
          track_id: trackId,
          application_id: applicationId,
          sections: nextSections,
          updated_at: now,
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk({
    section: sectionId,
    content: content ?? "",
    completion_percentage: completion,
    saved_at: now,
  });
}
