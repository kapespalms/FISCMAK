import {
  assembleFullCoverLetter,
  buildCoverLetterMakContext,
  COVER_LETTER_FORMATTING,
  COVER_LETTER_STAGES,
  COVER_LETTER_UNIVERSAL_TIPS,
  completionForCoverLetterSection,
  getCoverLetterStageDef,
  getSectionsForCoverLetterStage,
  normalizeCoverLetterStage,
  type CoverLetterStageId,
} from "@/lib/v2/cover-letter-templates";
import {
  buildCoverLetterContextualGuidance,
  COVER_LETTER_ADVANCED_STRATEGIES,
  COVER_LETTER_INSTITUTIONAL_SETTINGS,
  COVER_LETTER_POSITION_TYPES,
  COVER_LETTER_SAMPLE_LETTERS,
  COVER_LETTER_SPECIALTY_CATEGORIES,
  COVER_LETTER_SUBMISSION_CHECKLIST,
  enrichSectionPrompts,
  inferPositionTypeFromSetting,
  inferSpecialtyCategory,
  normalizeInstitutionalSetting,
  normalizePositionType,
  type CoverLetterInstitutionalSettingId,
  type CoverLetterPositionTypeId,
  type CoverLetterSpecialtyCategoryId,
} from "@/lib/v2/cover-letter-guide";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type CoverLetterSectionRow = {
  section: string;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
  prompts: string[];
  example: string | null;
};

function resolveCoverLetter(
  meta: ReturnType<typeof getOnboardingMetadata>,
  user?: { career_stage?: string | null; specialty?: string | null; practice_setting?: string | null },
) {
  const stored = meta.cover_letter;
  const stageId = stored?.stage_id ?? normalizeCoverLetterStage(user?.career_stage);
  const positionType =
    stored?.position_type ?? inferPositionTypeFromSetting(user?.practice_setting);
  const institutionalSetting = stored?.institutional_setting ?? normalizeInstitutionalSetting(null);
  const specialtyCategory =
    stored?.specialty_category ?? inferSpecialtyCategory(user?.specialty);
  return {
    stageId,
    positionType,
    institutionalSetting,
    specialtyCategory,
    sections: stored?.sections ?? {},
    checklist: stored?.checklist ?? {},
  };
}

function rowsForStage(
  stageId: CoverLetterStageId,
  sections: Record<string, { content?: string; completion_percentage?: number }>,
  context: {
    positionType: CoverLetterPositionTypeId;
    institutionalSetting: CoverLetterInstitutionalSettingId;
    specialtyCategory: CoverLetterSpecialtyCategoryId;
  },
): CoverLetterSectionRow[] {
  return getSectionsForCoverLetterStage(stageId).map((def) => {
    const saved = sections[def.id];
    const content = saved?.content ?? null;
    return {
      section: def.id,
      title: def.title,
      subtitle: def.subtitle,
      target_words: def.targetWords,
      content,
      completion_percentage:
        saved?.completion_percentage ??
        completionForCoverLetterSection(content ?? "", def.targetWords),
      prompts: enrichSectionPrompts(def.prompts, {
        stageId,
        positionType: context.positionType,
        institutionalSetting: context.institutionalSetting,
        specialtyCategory: context.specialtyCategory,
        sectionId: def.id,
      }),
      example: def.example ?? null,
    };
  });
}

function buildPayload(
  stageId: CoverLetterStageId,
  positionType: CoverLetterPositionTypeId,
  institutionalSetting: CoverLetterInstitutionalSettingId,
  specialtyCategory: CoverLetterSpecialtyCategoryId,
  sections: Record<string, { content?: string; completion_percentage?: number }>,
  checklist: Record<string, boolean>,
  user?: {
    name?: string | null;
    specialty?: string | null;
    career_stage?: string | null;
    institution?: string | null;
  },
) {
  const stage = getCoverLetterStageDef(stageId);
  const rows = rowsForStage(stageId, sections, {
    positionType,
    institutionalSetting,
    specialtyCategory,
  });
  const overall = rows.length
    ? Math.round(rows.reduce((sum, s) => sum + s.completion_percentage, 0) / rows.length)
    : 0;
  const contextual = buildCoverLetterContextualGuidance({
    stageId,
    positionType,
    institutionalSetting,
    specialtyCategory,
  });

  return {
    stage_id: stageId,
    position_type: positionType,
    institutional_setting: institutionalSetting,
    specialty_category: specialtyCategory,
    label: stage.label,
    emphasis: stage.emphasis,
    universal_tips: COVER_LETTER_UNIVERSAL_TIPS,
    formatting_notes: COVER_LETTER_FORMATTING,
    position_types: COVER_LETTER_POSITION_TYPES,
    institutional_settings: COVER_LETTER_INSTITUTIONAL_SETTINGS.map((s) => ({
      id: s.id,
      label: s.label,
    })),
    specialty_categories: COVER_LETTER_SPECIALTY_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
    })),
    contextual_guidance: contextual,
    advanced_strategies: {
      avoid: COVER_LETTER_ADVANCED_STRATEGIES.avoid,
      red_flags: COVER_LETTER_ADVANCED_STRATEGIES.redFlags,
      specificity: COVER_LETTER_ADVANCED_STRATEGIES.specificity,
    },
    sample_letters: COVER_LETTER_SAMPLE_LETTERS.filter(
      (s) => s.stageId === stageId || s.positionType === positionType,
    ).slice(0, 3),
    submission_checklist: COVER_LETTER_SUBMISSION_CHECKLIST.map((item, i) => ({
      id: `check_${i}`,
      label: item,
      checked: checklist[`check_${i}`] ?? false,
    })),
    sections: rows,
    overall_completion: overall,
    full_draft_preview: assembleFullCoverLetter(stageId, sections),
    mak_context: buildCoverLetterMakContext({
      stageId,
      specialty: user?.specialty ?? undefined,
      positionType,
      institutionalSetting,
      specialtyCategory,
    }),
    user: {
      name: user?.name,
      specialty: user?.specialty,
      career_stage: user?.career_stage,
      institution: user?.institution,
    },
  };
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = getOnboardingMetadata(user ?? ({} as import("@/lib/v2/types").AppUser));
  const ctx = resolveCoverLetter(meta, user ?? undefined);

  return jsonOk(
    buildPayload(
      ctx.stageId,
      ctx.positionType,
      ctx.institutionalSetting,
      ctx.specialtyCategory,
      ctx.sections,
      ctx.checklist,
      user ?? undefined,
    ),
  );
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = (await request.json()) as {
    stage_id?: CoverLetterStageId;
    position_type?: CoverLetterPositionTypeId;
    institutional_setting?: CoverLetterInstitutionalSettingId;
    specialty_category?: CoverLetterSpecialtyCategoryId;
    checklist?: Record<string, boolean>;
  };
  const meta = getOnboardingMetadata(user);
  const current = resolveCoverLetter(meta, user);
  const now = new Date().toISOString();

  const stageId = body.stage_id ?? current.stageId;
  const positionType = body.position_type ?? current.positionType;
  const institutionalSetting = body.institutional_setting ?? current.institutionalSetting;
  const specialtyCategory = body.specialty_category ?? current.specialtyCategory;
  const checklist = body.checklist ? { ...current.checklist, ...body.checklist } : current.checklist;

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        cover_letter: {
          stage_id: stageId,
          position_type: positionType,
          institutional_setting: institutionalSetting,
          specialty_category: specialtyCategory,
          sections: current.sections,
          checklist,
          updated_at: now,
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk(
    buildPayload(
      stageId,
      positionType,
      institutionalSetting,
      specialtyCategory,
      current.sections,
      checklist,
      user,
    ),
  );
}

export { COVER_LETTER_STAGES };
