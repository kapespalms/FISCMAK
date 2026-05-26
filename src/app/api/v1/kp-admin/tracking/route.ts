import { fetchAssessments, fetchDocuments } from "@/lib/v2/db";
import { getAppUser, isErrorResponse, jsonOk } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { buildKpAdminMakSignalPreview } from "@/lib/v2/mak-coaching-engine";
import { requireKpAdminApiUser } from "@/lib/v2/kp-admin";

/** KP Admin — internal Mak coaching signals mirror (never user-facing). */
export async function GET() {
  const auth = await requireKpAdminApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const assessments = await fetchAssessments(auth.userId, auth.demo);
  const cv = documents.find((d) => d.document_type === "CV" && d.extracted_text);
  const meta = user ? getOnboardingMetadata(user) : {};

  const preview = buildKpAdminMakSignalPreview(cv?.extracted_text, assessments, meta);

  return jsonOk({
    user_id: auth.userId,
    email: auth.email,
    cv_uploaded: Boolean(cv),
    tracking: preview.tracking,
    mak_coaching: {
      escalation_level: preview.mak_bundle.escalation_level,
      hints: preview.mak_bundle.hints,
      context_block: preview.mak_bundle.context_block,
    },
  });
}
