import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  CAREER_PIVOT_STEPS,
  IDENTITY_NAVIGATION_PROMPTS,
  PIVOT_QUARTERLY_BY_PATH,
  buildCareerPivotIntro,
  buildClinicalToTargetTranslationPrompt,
  type CareerPivotContext,
  type NonTraditionalTargetPath,
  type PivotTranslationEntry,
} from "@/lib/v2/non-traditional-career-models";

export type CareerPivotSession = {
  step_index: number;
  started_at: string;
  partial?: Partial<CareerPivotContext>;
};

export type PivotQuarterlySession = {
  path: NonTraditionalTargetPath;
  module_index: number;
  started_at: string;
  captures: Record<string, string>;
};

export type IdentityNavigationSession = {
  prompt_index: number;
  started_at: string;
  responses: string[];
};

export type CareerTranslationSession = {
  clinical_experience: string;
  step: "awaiting_translation";
  started_at: string;
};

export type CareerPivotFlowTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  complete: boolean;
};

export function initCareerPivotSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    career_pivot_session: {
      step_index: 0,
      started_at: new Date().toISOString(),
      partial: meta.career_pivot_context ?? {},
    },
  };
}

export function initPivotQuarterlySession(
  meta: OnboardingMetadata,
  path: NonTraditionalTargetPath,
): OnboardingMetadata {
  return {
    ...meta,
    pivot_quarterly_session: {
      path,
      module_index: 0,
      started_at: new Date().toISOString(),
      captures: {},
    },
  };
}

export function initIdentityNavigationSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    identity_navigation_session: {
      prompt_index: 0,
      started_at: new Date().toISOString(),
      responses: [],
    },
  };
}

export function clearCareerPivotSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { career_pivot_session: _, ...rest } = meta;
  return rest;
}

export function clearPivotQuarterlySession(meta: OnboardingMetadata): OnboardingMetadata {
  const { pivot_quarterly_session: _, ...rest } = meta;
  return rest;
}

export function clearIdentityNavigationSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { identity_navigation_session: _, ...rest } = meta;
  return rest;
}

export function initCareerTranslationSession(
  meta: OnboardingMetadata,
  clinicalExperience: string,
): OnboardingMetadata {
  return {
    ...meta,
    career_translation_session: {
      clinical_experience: clinicalExperience,
      step: "awaiting_translation",
      started_at: new Date().toISOString(),
    },
  };
}

export function clearCareerTranslationSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { career_translation_session: _, ...rest } = meta;
  return rest;
}

function parseTargetPath(text: string): NonTraditionalTargetPath | undefined {
  const lower = text.toLowerCase();
  if (/industry|pharma|medical affairs|biotech/.test(lower)) return "industry_pharma";
  if (/policy|government|public health|regulatory/.test(lower)) return "policy_government";
  if (/media|communication|writing|journalism|podcast/.test(lower)) return "media_communication";
  if (/startup|entrepreneur|health tech|founder/.test(lower)) return "entrepreneurship_healthtech";
  if (/consult/.test(lower)) return "consulting";
  if (/hybrid|part.time|part time|both/.test(lower)) return "hybrid";
  if (/explor|decid|unsure|consider/.test(lower)) return "exploring";
  return undefined;
}

export function processCareerPivotTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): CareerPivotFlowTurnResult {
  const session = input.meta.career_pivot_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildCareerPivotIntro(),
      suggested_actions: [],
      complete: false,
    };
  }

  const step = CAREER_PIVOT_STEPS[session.step_index];
  if (!step) {
    return {
      meta: clearCareerPivotSession(input.meta),
      response: "Pivot context complete.",
      suggested_actions: [],
      complete: true,
    };
  }

  let value: string | boolean = input.message.trim();
  if (step.field === "hybrid_model") {
    value = /yes|hybrid|part|both|split|1-|2 day|keep clinical/i.test(input.message);
  } else if (step.field === "target_path") {
    const parsed = parseTargetPath(input.message);
    value = parsed ?? input.message.trim();
  }

  const partial = {
    ...(session.partial ?? {}),
    [step.field]: value,
  } as Partial<CareerPivotContext>;

  const nextIdx = session.step_index + 1;
  const nextStep = CAREER_PIVOT_STEPS[nextIdx];

  if (!nextStep) {
    const context: CareerPivotContext = {
      ...partial,
      captured_at: new Date().toISOString(),
    } as CareerPivotContext;
    const cleared = clearCareerPivotSession(input.meta);
    return {
      meta: { ...cleared, career_pivot_context: context },
      response: `Pivot context saved. I'll translate your clinical work for outsider audiences and generate resume, cover letter, or portfolio formats — not a 20-page CV.

Ready to translate a specific experience, or start path-specific quarterly mining?`,
      suggested_actions: [
        { action: "Translate an experience", url: "/app/objective?tab=activities" },
        { action: "Build pivot narrative", url: "/app/output" },
      ],
      complete: true,
    };
  }

  return {
    meta: {
      ...input.meta,
      career_pivot_session: { ...session, step_index: nextIdx, partial },
    },
    response: `Got it.\n\n${nextStep.prompt(partial)}`,
    suggested_actions: [],
    complete: false,
  };
}

export function processPivotQuarterlyTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): CareerPivotFlowTurnResult {
  const session = input.meta.pivot_quarterly_session;
  const path =
    session?.path ??
    input.meta.career_pivot_context?.target_path ??
    "exploring";

  if (!session) {
    const modules = PIVOT_QUARTERLY_BY_PATH[path];
    return {
      meta: initPivotQuarterlySession(input.meta, path),
      response: `Path-specific capture.\n\n${modules[0]?.prompt ?? "What transferable experience should we document?"}`,
      suggested_actions: [],
      complete: false,
    };
  }

  const modules = PIVOT_QUARTERLY_BY_PATH[session.path];
  const current = modules[session.module_index];
  if (!current) {
    return {
      meta: clearPivotQuarterlySession(input.meta),
      response: "Path-specific capture complete.",
      suggested_actions: [{ action: "Translate to resume bullet", url: "/app/output" }],
      complete: true,
    };
  }

  const captures = { ...session.captures, [current.id]: input.message.trim() };
  const nextIndex = session.module_index + 1;
  const nextMod = modules[nextIndex];

  if (!nextMod) {
    const cleared = clearPivotQuarterlySession(input.meta);
    const entries = [
      ...(input.meta.pivot_quarterly_captures ?? []),
      {
        id: crypto.randomUUID(),
        path: session.path,
        completed_at: new Date().toISOString(),
        modules: captures,
      },
    ];
    return {
      meta: { ...cleared, pivot_quarterly_captures: entries },
      response:
        "Captured. Next I'll help translate these into outsider-language bullets for your resume or pivot letter.",
      suggested_actions: [
        { action: "Build pivot narrative", url: "/app/output" },
        { action: "Industry resume guidance", url: "/app/output" },
      ],
      complete: true,
    };
  }

  return {
    meta: {
      ...input.meta,
      pivot_quarterly_session: { ...session, module_index: nextIndex, captures },
    },
    response: `Saved.\n\n${nextMod.prompt}`,
    suggested_actions: [],
    complete: false,
  };
}

export function processIdentityNavigationTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): CareerPivotFlowTurnResult {
  const session = input.meta.identity_navigation_session;
  if (!session) {
    return {
      meta: initIdentityNavigationSession(input.meta),
      response: `Identity navigation — career transitions carry weight beyond a resume.

${IDENTITY_NAVIGATION_PROMPTS[0]}`,
      suggested_actions: [],
      complete: false,
    };
  }

  const responses = [...session.responses, input.message.trim()];
  const nextIdx = session.prompt_index + 1;
  const nextPrompt = IDENTITY_NAVIGATION_PROMPTS[nextIdx];

  if (!nextPrompt) {
    const cleared = clearIdentityNavigationSession(input.meta);
    const notes = responses.join("\n\n");
    return {
      meta: {
        ...cleared,
        career_pivot_context: {
          ...(input.meta.career_pivot_context ?? {}),
          identity_notes: notes,
        },
      },
      response:
        "Thank you — this material often becomes the most authentic part of a pivot narrative.",
      suggested_actions: [{ action: "Draft pivot narrative", url: "/app/output" }],
      complete: true,
    };
  }

  return {
    meta: {
      ...input.meta,
      identity_navigation_session: {
        ...session,
        prompt_index: nextIdx,
        responses,
      },
    },
    response: nextPrompt,
    suggested_actions: [],
    complete: false,
  };
}

export function processCareerTranslationTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): CareerPivotFlowTurnResult {
  const session = input.meta.career_translation_session;
  if (!session) {
    return {
      meta: input.meta,
      response:
        "Which clinical or academic experience should we translate into outsider language for your target path?",
      suggested_actions: [],
      complete: false,
    };
  }

  const path = input.meta.career_pivot_context?.target_path ?? "industry_pharma";
  const entry: PivotTranslationEntry = {
    id: crypto.randomUUID(),
    clinical_experience: session.clinical_experience,
    target_path: path,
    translated_framing: input.message.trim(),
    captured_at: new Date().toISOString(),
  };

  const cleared = clearCareerTranslationSession(input.meta);
  return {
    meta: { ...cleared, pivot_translations: [...(input.meta.pivot_translations ?? []), entry] },
    response: `Translation saved for ${path}. I'll use this when generating your resume or pivot letter.`,
    suggested_actions: [
      { action: "Translate another experience", url: "/app/objective?tab=activities" },
      { action: "Build pivot narrative", url: "/app/output" },
    ],
    complete: true,
  };
}

export function buildCareerTranslationFollowUp(clinicalExperience: string, path: NonTraditionalTargetPath): string {
  return `${buildClinicalToTargetTranslationPrompt(clinicalExperience, path)}

In your own words: how would you describe the impact of "${clinicalExperience}" to someone outside medicine? Include numbers only if you can verify them.`;
}

export function buildCareerPivotMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.career_pivot_session;
  if (!session) return "";
  const step = CAREER_PIVOT_STEPS[session.step_index];
  if (!step) return "";
  return `Career pivot onboarding — step ${session.step_index + 1}/${CAREER_PIVOT_STEPS.length}. Ask: ${step.prompt(session.partial ?? {})}`;
}

export function buildPivotQuarterlyMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.pivot_quarterly_session;
  if (!session) return "";
  const modules = PIVOT_QUARTERLY_BY_PATH[session.path];
  const mod = modules[session.module_index];
  return mod ? `Pivot quarterly — ${session.path}: ${mod.prompt}` : "";
}
