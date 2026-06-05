import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  QUARTERLY_MODULES,
  type QuarterlyPulseModule,
} from "@/lib/v2/quarterly-pulse";
import type { PracticeSetting } from "@/lib/v2/onboarding-options";
import { invisibleWorkPromptsForSetting } from "@/lib/v2/invisible-work-taxonomy";

export type QuarterlyPulseSession = {
  started_at: string;
  current_module_index: number;
  completed_module_ids: string[];
};

export function getQuarterlyPulseSession(
  meta: OnboardingMetadata,
): QuarterlyPulseSession | null {
  return meta.quarterly_pulse_session ?? null;
}

export function initQuarterlyPulseSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    quarterly_pulse_session: {
      started_at: new Date().toISOString(),
      current_module_index: 0,
      completed_module_ids: [],
    },
  };
}

export function advanceQuarterlyPulseSession(meta: OnboardingMetadata): OnboardingMetadata {
  const session = meta.quarterly_pulse_session;
  if (!session) return initQuarterlyPulseSession(meta);

  const currentModule = QUARTERLY_MODULES[session.current_module_index];
  const completed = currentModule
    ? [...new Set([...session.completed_module_ids, currentModule.id])]
    : session.completed_module_ids;

  const nextIndex = Math.min(
    session.current_module_index + 1,
    QUARTERLY_MODULES.length - 1,
  );

  return {
    ...meta,
    quarterly_pulse_session: {
      ...session,
      current_module_index: nextIndex,
      completed_module_ids: completed,
    },
  };
}

export function clearQuarterlyPulseSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { quarterly_pulse_session: _, ...rest } = meta;
  return rest;
}

export function currentQuarterlyModule(
  meta: OnboardingMetadata,
): QuarterlyPulseModule | null {
  const session = meta.quarterly_pulse_session;
  if (!session) return QUARTERLY_MODULES[0] ?? null;
  return QUARTERLY_MODULES[session.current_module_index] ?? null;
}

const MODULE_PROMPTS: Record<
  string,
  (setting: PracticeSetting | null) => string
> = {
  burnout_screen: () =>
    `Well-being check (S-1):

Using your own definition of burnout, how would you rate your current level? (1–5)

1 = No symptoms. 2 = Stressed but not burned out. 3 = Burning out, have symptoms. 4 = Symptoms persist, hard to function. 5 = Completely burned out.

Share a number or a brief description of how you've been feeling.`,

  invisible_pulse: (setting) => {
    const prompts = invisibleWorkPromptsForSetting(setting);
    return `Unrecognized work pulse (S-3):

Estimate weekly hours for each category:
${prompts.map((p) => `- ${p.prompt}`).join("\n")}

Also share your biggest category change since last quarter.`;
  },

  career_momentum: () =>
    `Career momentum check:

1. Progress on your active goals this quarter?
2. Any new achievements (publications, grants, roles, awards)?
3. Biggest barrier to progress?
4. Track energy (1–10)?
5. Any interest in changing setting or track?`,

  cv_update: () =>
    `Quick CV update (O-1):

Any new publications, grants, committee roles, teaching assignments, or awards since your last update?
List them briefly — the platform will reconcile against API enrichment.`,
};

export function buildQuarterlyMakSystemContext(meta: OnboardingMetadata): string {
  const activeModule = currentQuarterlyModule(meta);
  if (!activeModule) return "";
  return `Quarterly pulse session active. Current module: ${activeModule.name} (${activeModule.id}). ${activeModule.description}. When the physician completes this module, acknowledge capture and offer the next module prompt.`;
}

export function isQuarterlyModuleAdvanceMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("next module") ||
    lower.includes("continue") ||
    lower.includes("done with this") ||
    lower.includes("ready for next")
  );
}

export function buildQuarterlyModulePrompt(
  module: QuarterlyPulseModule,
  setting: PracticeSetting | null = "Academic",
): string {
  const builder = MODULE_PROMPTS[module.id];
  if (!builder) {
    return `${module.name}: ${module.description}`;
  }
  return builder(setting);
}
