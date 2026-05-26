import {
  dossierItemById,
  normalizeAcademicDossierStage,
} from "@/lib/v2/academic-dossier-templates";
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
  { params }: { params: Promise<{ itemId: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { itemId } = await params;

  if (!dossierItemById(itemId)) {
    return jsonOk({ error: "validation_error", message: "Unknown dossier item" }, 400);
  }

  const body = (await request.json()) as { checked?: boolean; notes?: string };
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const stored = meta.academic_dossier;
  const stageId = stored?.stage_id ?? normalizeAcademicDossierStage(user.career_stage);
  const now = new Date().toISOString();
  const isSupporting = itemId.startsWith("support_");

  const items = { ...(stored?.items ?? {}) };
  const supporting = { ...(stored?.supporting ?? {}) };
  const patch = {
    ...(isSupporting ? supporting[itemId] : items[itemId]),
    ...(body.checked !== undefined ? { checked: body.checked } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    updated_at: now,
  };

  if (isSupporting) supporting[itemId] = patch;
  else items[itemId] = patch;

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        academic_dossier: { stage_id: stageId, items, supporting, updated_at: now },
      } as Record<string, unknown>,
    },
    auth.demo,
  );

  return jsonOk({ item_id: itemId, saved_at: now });
}
