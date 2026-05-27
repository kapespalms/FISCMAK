import {
  assembleDossierSummary,
  DOSSIER_FORMATTING_GUIDELINES,
  DOSSIER_SUPPORTING_DOCUMENTS,
  dossierCompletion,
  getDossierStageDef,
  normalizeAcademicDossierStage,
  type AcademicDossierStageId,
} from "@/lib/v2/academic-dossier-templates";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

function resolveDossier(meta: ReturnType<typeof getOnboardingMetadata>, careerStage?: string | null) {
  const stored = meta.academic_dossier;
  const stageId = stored?.stage_id ?? normalizeAcademicDossierStage(careerStage);
  return {
    stageId,
    items: stored?.items ?? {},
    supporting: stored?.supporting ?? {},
  };
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = getOnboardingMetadata(user ?? ({} as import("@/lib/v2/types").AppUser));
  const { stageId, items, supporting } = resolveDossier(meta, user?.career_stage);
  const stage = getDossierStageDef(stageId);
  const completion = dossierCompletion(stageId, items, supporting);

  return jsonOk({
    stage_id: stageId,
    purpose: stage.purpose,
    sections: stage.sections.map((s) => ({
      id: s.id,
      title: s.title,
      items: s.items.map((i) => ({
        id: i.id,
        label: i.label,
        hint: i.hint ?? null,
        checked: items[i.id]?.checked ?? false,
        notes: items[i.id]?.notes ?? null,
        updated_at: items[i.id]?.updated_at ?? null,
      })),
    })),
    supporting_documents: DOSSIER_SUPPORTING_DOCUMENTS.map((d) => ({
      id: d.id,
      label: d.label,
      hint: d.hint ?? null,
      checked: supporting[d.id]?.checked ?? false,
      notes: supporting[d.id]?.notes ?? null,
      updated_at: supporting[d.id]?.updated_at ?? null,
    })),
    formatting_guidelines: DOSSIER_FORMATTING_GUIDELINES,
    overall_completion: completion,
    summary_preview: assembleDossierSummary({ stageId, items, supporting }),
    user: { specialty: user?.specialty, career_stage: user?.career_stage },
  });
}

export async function PATCH(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = (await request.json()) as { stage_id?: AcademicDossierStageId };
  const meta = getOnboardingMetadata(user);
  const current = resolveDossier(meta, user.career_stage);
  const stageId = body.stage_id ?? current.stageId;
  const now = new Date().toISOString();

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        academic_dossier: {
          stage_id: stageId,
          items: current.items,
          supporting: current.supporting,
          updated_at: now,
        },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  const completion = dossierCompletion(stageId, current.items, current.supporting);
  return jsonOk({
    stage_id: stageId,
    overall_completion: completion,
    summary_preview: assembleDossierSummary({
      stageId,
      items: current.items,
      supporting: current.supporting,
    }),
  });
}
