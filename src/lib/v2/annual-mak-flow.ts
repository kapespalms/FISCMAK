import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { PFI_ANCHORS } from "@/lib/v2/pfi-scale";
import {
  ANNUAL_REFRESH_MODULES,
  type AnnualRefreshModule,
} from "@/lib/v2/annual-refresh";

export type AnnualRefreshSession = {
  started_at: string;
  current_module_index: number;
  completed_module_ids: string[];
};

export function getAnnualRefreshSession(
  meta: OnboardingMetadata,
): AnnualRefreshSession | null {
  return meta.annual_refresh_session ?? null;
}

export function initAnnualRefreshSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    annual_refresh_session: {
      started_at: new Date().toISOString(),
      current_module_index: 0,
      completed_module_ids: [],
    },
  };
}

export function advanceAnnualRefreshSession(meta: OnboardingMetadata): OnboardingMetadata {
  const session = meta.annual_refresh_session;
  if (!session) return initAnnualRefreshSession(meta);

  const currentModule = ANNUAL_REFRESH_MODULES[session.current_module_index];
  const completed = currentModule
    ? [...new Set([...session.completed_module_ids, currentModule.id])]
    : session.completed_module_ids;

  const nextIndex = Math.min(
    session.current_module_index + 1,
    ANNUAL_REFRESH_MODULES.length - 1,
  );

  return {
    ...meta,
    annual_refresh_session: {
      ...session,
      current_module_index: nextIndex,
      completed_module_ids: completed,
    },
  };
}

export function clearAnnualRefreshSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { annual_refresh_session: _, ...rest } = meta;
  return rest;
}

export function currentAnnualModule(
  meta: OnboardingMetadata,
): AnnualRefreshModule | null {
  const session = meta.annual_refresh_session;
  if (!session) return ANNUAL_REFRESH_MODULES[0] ?? null;
  return ANNUAL_REFRESH_MODULES[session.current_module_index] ?? null;
}

const MODULE_PROMPTS: Record<string, (name: string) => string> = {
  career_direction: (name) =>
    `${name}, let's begin the annual career direction review (S-6).

1. How would you characterize your current professional trajectory?
2. Has your 3-year career objective changed since your last update?
3. On a scale of 1–10, how energized do you feel about your current career track?`,

  work_engagement: () =>
    `Work Engagement (UWES-9) — annual vigor check (S-7):

Rate each from 1 (never) to 7 (always):
- At work, I feel bursting with energy
- At my job, I feel strong and vigorous
- When I get up in the morning, I feel like going to work

Share your responses or a brief summary of your current work engagement.`,

  pfi_full: () =>
    `Baseline well-being — professional fulfillment (published PFI items):

We'll use the standard 0–4 scale (${PFI_ANCHORS}).

Share how you've been feeling this year — or we'll walk through fulfillment and exhaustion items one at a time in the next messages.`,

  bits_full: () =>
    `Task Burden review (S-2 / BITS):

1. How often do you receive tasks that seem unnecessary or outside your role?
2. How often are you asked to do things that should be someone else's responsibility?
3. Overall unreasonable task burden (1–5)?`,

  invisible_work_annual: () =>
    `Unrecognized Work annual review (S-3):

Estimate weekly hours for:
- Documentation overspill
- Care coordination outside clinical time
- DEI / service work not in job description
- Mentoring / advising without protected time

Total unrecognized hours per week?`,

  career_data_refresh: () =>
    `Career Data refresh (O-1):

Have you uploaded an updated CV this year? Any new publications, grants, committee roles, or certifications to add?

The platform will run API enrichment (OpenAlex, NIH RePORTER, NPPES) after your CV is current.`,

  goal_annual_reset: () =>
    `Goal Annual Reset (P-5):

Review your three goals — Development, Maintenance, and Sustainability.

For each goal: continue as-is, modify milestones, or replace entirely?

Start with your Development goal — how did this year go?`,
};

export function buildAnnualModulePrompt(
  module: AnnualRefreshModule,
  displayName = "there",
): string {
  const fn = MODULE_PROMPTS[module.id];
  return fn ? fn(displayName) : module.description;
}

export function buildAnnualMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.annual_refresh_session;
  if (!session) return "";

  const activeModule = currentAnnualModule(meta);
  if (!activeModule) return "";

  const completed = session.completed_module_ids.length;
  const total = ANNUAL_REFRESH_MODULES.length;

  return `Annual refresh in progress (${completed}/${total} modules complete). Current module: ${activeModule.name} (${activeModule.conversation_id}). Guide the physician through this module conversationally. When the module is sufficiently captured, offer to continue to the next module. Modules remaining after this: ${ANNUAL_REFRESH_MODULES.slice(session.current_module_index + 1).map((m) => m.name).join(", ") || "none"}.`;
}

export function isAnnualModuleAdvanceMessage(message: string): boolean {
  return /^(continue|next module|next section|proceed|move on|done with this)/i.test(
    message.trim(),
  );
}
