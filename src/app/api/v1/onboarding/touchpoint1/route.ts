import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { trustedNameFromOAuthMetadata, splitTrustedName } from "@/lib/auth/trusted-name";
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
import { onboardingPathFromMetadata } from "@/lib/v2/onboarding-path";
import { resolveProfileContractFromUser } from "@/lib/v2/profile-contract";
import { deriveOnboardingStatus } from "@/lib/v2/onboarding-progress";

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
  const pathCtx = onboardingPathFromMetadata(meta);
  const program = pathCtx?.program ?? null;

  let trustedName: ReturnType<typeof trustedNameFromOAuthMetadata> = null;
  if (!auth.demo && isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      trustedName = trustedNameFromOAuthMetadata(
        authUser?.user_metadata as Record<string, unknown> | undefined,
      );
    } catch {
      /* ignore */
    }
  }
  if (!trustedName && user.tier1_complete && user.name?.trim()) {
    const { first, last } = splitTrustedName(user.name);
    if (first) trustedName = { first, last, source: "profile" };
  }

  const contract = resolveProfileContractFromUser(user);

  return jsonOk({
    profile: {
      name: user.name,
      trusted_name: trustedName,
      specialty: user.specialty,
      base_specialty: user.base_specialty,
      subspecialty: user.subspecialty,
      subspecialty_training_complete: user.subspecialty_training_complete,
      career_stage: user.career_stage,
      practice_setting: user.practice_setting,
      academic_rank: user.academic_rank,
      primary_career_track: user.primary_career_track,
      pgy_level: user.pgy_level,
      current_rotation: user.current_rotation,
      specialty_origin: user.specialty_origin,
      institution: user.institution,
    },
    onboarding_metadata: {
      career_track_rankings: meta.career_track_rankings ?? null,
      subspecialty_interests: meta.subspecialty_interests ?? null,
      uh_psych_enrichment_tracks: meta.uh_psych_enrichment_tracks ?? null,
      invite_token: meta.invite_token ?? null,
    },
    onboarding: {
      path: pathCtx?.path ?? null,
      path_chosen: Boolean(meta.onboarding_path),
      program_id: meta.program_id ?? null,
      program_slug: meta.program_slug ?? null,
      trainee_initials: meta.trainee_initials ?? null,
      program: program
        ? {
            slug: program.slug,
            display_title: program.display_title,
            institution_name: program.institution_name,
            program_name: program.program_name,
            base_specialty: program.base_specialty,
            specialty_locked: program.specialty_locked,
            default_career_stage: program.default_career_stage,
            default_practice_setting: program.default_practice_setting,
            career_stages_allowed: program.career_stages_allowed,
            academic_year: program.academic_year,
            rotations: program.rotations,
          }
        : null,
    },
    documents: docs,
    instruments,
    api_enrichment: enrichment,
    tier1_complete: user.tier1_complete,
    tier2_complete: user.tier2_complete,
    tier3_complete: user.tier3_complete,
    onboarding_status: deriveOnboardingStatus(user),
    current_onboarding_step: user.current_onboarding_step ?? null,
    coach_mak_conversation_id: user.coach_mak_conversation_id ?? null,
    cv_uploaded: user.cv_uploaded,
    pending_reconcile_count: (meta.reconciliation ?? []).filter((r) => r.status === "pending").length,
    reconciliation: meta.reconciliation ?? [],
    instrument_progress: meta.instrument_answers?.length ?? 0,
    profile_contract: contract
      ? {
          persona_id: contract.persona_id,
          user_surfaces: contract.user_surfaces,
          onboarding_layers: contract.onboarding_layers,
          cohort_aggregate_only: contract.cohort_aggregate_only,
        }
      : null,
  });
}
