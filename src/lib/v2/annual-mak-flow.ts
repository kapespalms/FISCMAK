import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
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
    `Work engagement — annual vigor check (S-7):

Three quick questions on a 1 (never) to 7 (always) scale:
- At work, I feel bursting with energy
- At my job, I feel strong and vigorous
- When I get up in the morning, I feel like going to work

Share your responses or a brief summary of your current work engagement.`,

  wellbeing_check: () =>
    `Annual well-being check-in — a few quick questions:

1. Using your own definition, how burned out do you feel right now? (1 = not at all, 5 = completely burned out)
2. Overall, how has your well-being been this past year? (0 = poor, 5 = excellent)

Share your responses or a brief summary.`,

  invisible_work_burden: () =>
    `Task burden and invisible work review:

1. Roughly how many hours per week do you spend on unrecognized work — after-hours EHR, prior auth, informal mentoring, admin?
2. Has that changed meaningfully this year?`,

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
