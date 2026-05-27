import {
  fetchActivities,
  fetchAssessments,
  fetchDocuments,
} from "@/lib/v2/db";
import { getAppUser, isErrorResponse, jsonOk } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { buildKpAdminMakSignalPreview } from "@/lib/v2/mak-coaching-engine";
import { buildKpAdminEvaluationSummary } from "@/lib/v2/kp-admin-tracking";
import { requireKpAdminApiUser } from "@/lib/v2/kp-admin";
import { isTraineeCareerLevel } from "@/lib/v2/onboarding-options";
import { listBlocksForTrainee } from "@/lib/v2/programs/block-schedule";
import { lookupInviteTokenForUser } from "@/lib/v2/programs/invite-tokens";

async function resolveProgramBlocks(
  userId: string,
  meta: ReturnType<typeof getOnboardingMetadata>,
) {
  let initials = meta.trainee_initials?.trim().toUpperCase() ?? "";
  if (!initials) {
    const tokenRow = await lookupInviteTokenForUser(userId, meta.invite_token);
    initials = tokenRow?.trainee_initials?.trim().toUpperCase() ?? "";
  }
  if (!initials) return [];
  return listBlocksForTrainee(initials);
}

/** KP Admin — internal Mak coaching signals mirror (never user-facing). */
export async function GET() {
  const auth = await requireKpAdminApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const [documents, assessments, activities] = await Promise.all([
    fetchDocuments(auth.userId, auth.demo),
    fetchAssessments(auth.userId, auth.demo),
    fetchActivities(auth.userId, auth.demo, 500),
  ]);
  const cv = documents.find((d) => d.document_type === "CV" && d.extracted_text);
  const meta = user ? getOnboardingMetadata(user) : {};
  const scheduleEvents = meta.schedule_events ?? [];
  const programBlocks = user ? await resolveProgramBlocks(auth.userId, meta) : [];

  const preview = buildKpAdminMakSignalPreview(cv?.extracted_text, assessments, meta);
  const evaluation =
    user
      ? buildKpAdminEvaluationSummary({
          user,
          meta,
          assessments,
          activities,
          documents,
          scheduleEvents,
          programBlocks,
          isTrainee: isTraineeCareerLevel(user.career_stage),
        })
      : null;

  return jsonOk({
    user_id: auth.userId,
    email: auth.email,
    cv_uploaded: Boolean(cv),
    tracking: preview.tracking,
    evaluation,
    mak_coaching: {
      escalation_level: preview.mak_bundle.escalation_level,
      hints: preview.mak_bundle.hints,
      context_block: preview.mak_bundle.context_block,
    },
  });
}
