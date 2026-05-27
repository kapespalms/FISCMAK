import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ npi: null, npi_verified: false, deferred: false });

  const meta = getOnboardingMetadata(user);
  const snapshot = meta.enrichment_snapshot;

  return jsonOk({
    npi: snapshot?.npi ?? null,
    npi_verified: Boolean(snapshot?.npi_verified),
    deferred: Boolean(meta.npi_verification_deferred),
    provider_name: snapshot?.npi_provider_name ?? null,
    credential: snapshot?.npi_credential ?? null,
    organization: snapshot?.npi_organization ?? null,
    registry_url: snapshot?.npi
      ? `https://npiregistry.cms.hhs.gov/provider-view/${snapshot.npi}`
      : null,
  });
}
