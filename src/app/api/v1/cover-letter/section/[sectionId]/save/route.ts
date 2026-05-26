import {
  completionForCoverLetterSection,
  coverLetterSectionById,
  coverLetterStageForSection,
  normalizeCoverLetterStage,
} from "@/lib/v2/cover-letter-templates";
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
  const def = coverLetterSectionById(sectionId);
  if (!def) {
    return jsonOk({ error: "validation_error", message: "Unknown section" }, 400);
  }

  const { content } = (await request.json()) as { content?: string };
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const stored = meta.cover_letter;
  const stageId = stored?.stage_id ?? normalizeCoverLetterStage(user.career_stage);
  const sectionStage = coverLetterStageForSection(sectionId);
  if (sectionStage && sectionStage !== stageId) {
    return jsonOk({ error: "validation_error", message: "Section does not match current stage" }, 400);
  }

  const now = new Date().toISOString();
  const completion = completionForCoverLetterSection(content ?? "", def.targetWords);
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
        cover_letter: {
          stage_id: stageId,
          position_type: stored?.position_type,
          institutional_setting: stored?.institutional_setting,
          specialty_category: stored?.specialty_category,
          sections: nextSections,
          checklist: stored?.checklist,
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
