import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  deployedInstruments,
  documentRequirements,
  apiEnrichmentPlan,
  buildReconciliationCandidates,
} from "@/lib/v2/onboarding-touchpoint1";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const level = user.career_stage;
  const setting = user.practice_setting;
  const docs = documentRequirements(level, setting);
  const instruments = deployedInstruments(level, setting);
  const enrichment = apiEnrichmentPlan(setting, level);
  const meta = getOnboardingMetadata(user);

  return jsonOk({
    profile: {
      name: user.name,
      specialty: user.specialty,
      career_stage: user.career_stage,
      practice_setting: user.practice_setting,
      academic_rank: user.academic_rank,
      primary_career_track: user.primary_career_track,
    },
    documents: docs,
    instruments,
    api_enrichment: enrichment,
    tier1_complete: user.tier1_complete,
    tier2_complete: user.tier2_complete,
    tier3_complete: user.tier3_complete,
    reconciliation: meta.reconciliation ?? [],
    instrument_progress: meta.instrument_answers?.length ?? 0,
  });
}
