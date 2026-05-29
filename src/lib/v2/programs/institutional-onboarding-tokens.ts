import seed from "../../../../docs/seeds/institutional_onboarding_tokens.json";
import type { CareerLevel, PracticeSetting } from "@/lib/v2/onboarding-options";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import { lookupInviteToken } from "@/lib/v2/programs/invite-tokens";

export type InstitutionalTokenPrefill = {
  first_name?: string;
  last_name?: string;
  career_stage?: CareerLevel;
  base_specialty?: string;
  subspecialty?: string | null;
  practice_setting?: PracticeSetting;
  pgy_level?: string;
  current_rotation?: string;
};

export type InstitutionalOnboardingTokenRow = {
  token: string;
  program_slug: string;
  label?: string;
  prefill?: InstitutionalTokenPrefill;
};

export type InstitutionalTokenPreview = {
  valid: boolean;
  source: "configured" | "roster_invite" | null;
  token: string;
  program_slug: string | null;
  program_title: string | null;
  institution_name: string | null;
  label: string | null;
  prefill: InstitutionalTokenPrefill | null;
  roster_redeem: boolean;
  message?: string;
};

const configuredTokens = (seed as { tokens?: InstitutionalOnboardingTokenRow[] }).tokens ?? [];

export function lookupConfiguredInstitutionalToken(
  token: string,
): InstitutionalOnboardingTokenRow | null {
  const normalized = token.trim();
  if (!normalized) return null;
  return (
    configuredTokens.find((row) => row.token.toLowerCase() === normalized.toLowerCase()) ?? null
  );
}

export async function previewInstitutionalToken(token: string): Promise<InstitutionalTokenPreview> {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      valid: false,
      source: null,
      token: "",
      program_slug: null,
      program_title: null,
      institution_name: null,
      label: null,
      prefill: null,
      roster_redeem: false,
      message: "Enter an institutional token.",
    };
  }

  const configured = lookupConfiguredInstitutionalToken(trimmed);
  if (configured) {
    const program = getProgramBySlug(configured.program_slug);
    if (!program) {
      return {
        valid: false,
        source: "configured",
        token: trimmed,
        program_slug: configured.program_slug,
        program_title: null,
        institution_name: null,
        label: configured.label ?? null,
        prefill: configured.prefill ?? null,
        roster_redeem: false,
        message: "Token program is not registered.",
      };
    }
    return {
      valid: true,
      source: "configured",
      token: trimmed,
      program_slug: program.slug,
      program_title: program.display_title,
      institution_name: program.institution_name,
      label: configured.label ?? program.display_title,
      prefill: configured.prefill ?? null,
      roster_redeem: false,
    };
  }

  const roster = await lookupInviteToken(trimmed);
  if (!roster.valid) {
    return {
      valid: false,
      source: null,
      token: trimmed,
      program_slug: null,
      program_title: null,
      institution_name: null,
      label: null,
      prefill: null,
      roster_redeem: false,
      message: roster.message ?? "Token not recognized.",
    };
  }

  return {
    valid: true,
    source: "roster_invite",
    token: trimmed,
    program_slug: roster.program_slug,
    program_title: roster.program_title,
    institution_name: roster.institution_name,
    label: roster.label,
    prefill: null,
    roster_redeem: true,
    message: roster.available ? undefined : roster.message,
  };
}
