import {
  auditAcgmeOnboardingCoverage,
  listAcgmePrimarySpecialtyNames,
} from "@/lib/v2/gme/acgme-specialty-registry";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { isKpAdminEmail } from "@/lib/v2/kp-admin";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const audit = auditAcgmeOnboardingCoverage();
  const includeGaps = isKpAdminEmail(auth.email);

  return jsonOk({
    source: audit.source,
    primary_count: audit.primary_count,
    subspecialty_count: audit.subspecialty_count,
    seeded_framework_count: audit.seeded_framework_count,
    onboarding_primary_count: listAcgmePrimarySpecialtyNames().length,
    rows: audit.rows,
    milestone_seed_pending_count: audit.milestone_seed_pending.length,
    ...(includeGaps
      ? { gaps: audit.gaps, milestone_seed_pending: audit.milestone_seed_pending }
      : {}),
  });
}
