import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  CAREER_DIRECTION_STEPS,
  IDENTITY_NAVIGATION_PROMPTS,
  PIVOT_QUARTERLY_BY_PATH,
  buildCareerPivotIntro,
  buildCareerPivotProfileHints,
  buildClinicalToTargetTranslationPrompt,
  buildThesisDraftSentence,
  proposePathwaysFromThesis,
  NON_TRADITIONAL_PATH_LABELS,
  type CareerPivotContext,
  type CareerThesis,
  type NonTraditionalTargetPath,
  type PivotTranslationEntry,
} from "@/lib/v2/non-traditional-career-models";

export type CareerPivotSession = {
  step_index: number;
  started_at: string;
  partial?: Partial<CareerPivotContext>;
  thesis_partial?: Partial<CareerThesis>;
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
      thesis_partial: meta.career_thesis ?? {},
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
  if (/industry|pharma|medical affairs|biotech|msl|clinical development/.test(lower)) {
    return "industry_pharma";
  }
  if (/policy|government|public health|regulatory|fda|cms/.test(lower)) return "policy_government";
  if (/media|communication|writing|journalism|podcast|author/.test(lower)) {
    return "media_communication";
  }
  if (/startup|entrepreneur|health tech|founder|digital health/.test(lower)) {
    return "entrepreneurship_healthtech";
  }
  if (/consult|operations|strategy|advisory/.test(lower)) return "consulting";
  if (/hybrid|part.time|part time|both|split|keep clinical/.test(lower)) return "hybrid";
  if (/explor|decid|unsure|consider|still|open|not sure/.test(lower)) return "exploring";
  return undefined;
}

function parsePathwayChoice(
  text: string,
  proposed: NonTraditionalTargetPath[],
): NonTraditionalTargetPath {
  const lower = text.toLowerCase();
  const digitMatch = lower.match(/^(\d)/);
  if (digitMatch) {
    const idx = Number(digitMatch[1]) - 1;
    if (proposed[idx]) return proposed[idx];
  }
  const parsed = parseTargetPath(text);
  if (parsed) return parsed;
  for (const path of proposed) {
    if (lower.includes(NON_TRADITIONAL_PATH_LABELS[path].toLowerCase().slice(0, 12))) {
      return path;
    }
  }
  return proposed[0] ?? "exploring";
}

function finalizeCareerThesis(
  thesisPartial: Partial<CareerThesis>,
  sentence: string,
  proposedPaths: NonTraditionalTargetPath[],
): CareerThesis {
  const now = new Date().toISOString();
  return {
    ...thesisPartial,
    sentence: sentence.trim(),
    confidence: "confirmed",
    sources: [...(thesisPartial.sources ?? []), "conversation"],
    proposed_paths: proposedPaths,
    updated_at: now,
    confirmed_at: now,
  };
}

function stepInput(session: CareerPivotSession) {
  return {
    thesis: session.thesis_partial ?? {},
    context: session.partial ?? {},
  };
}

export function processCareerPivotTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): CareerPivotFlowTurnResult {
  const session = input.meta.career_pivot_session;
  if (!session) {
    const hints = buildCareerPivotProfileHints(input.meta);
    return {
      meta: input.meta,
      response: buildCareerPivotIntro(hints),
      suggested_actions: [],
      complete: false,
    };
  }

  const step = CAREER_DIRECTION_STEPS[session.step_index];
  if (!step) {
    return {
      meta: clearCareerPivotSession(input.meta),
      response: "Career direction session complete.",
      suggested_actions: [],
      complete: true,
    };
  }

  const trimmed = input.message.trim();
  let thesisPartial = { ...(session.thesis_partial ?? {}) };
  let contextPartial = { ...(session.partial ?? {}) };

  if (step.kind === "thesis" && step.field) {
    thesisPartial = {
      ...thesisPartial,
      [step.field]: trimmed,
      sources: [...(thesisPartial.sources ?? []), "conversation"],
    };
  } else if (step.kind === "thesis_confirm") {
    const sentence = trimmed || buildThesisDraftSentence(thesisPartial);
    const proposed = proposePathwaysFromThesis({ ...thesisPartial, sentence });
    thesisPartial = finalizeCareerThesis(thesisPartial, sentence, proposed);
  } else if (step.kind === "pathways") {
    const proposed =
      thesisPartial.proposed_paths ?? proposePathwaysFromThesis(thesisPartial);
    const chosen = parsePathwayChoice(trimmed, proposed);
    contextPartial = {
      ...contextPartial,
      target_path: chosen,
      certainty: /explor|unsure|decid|not sure/i.test(trimmed) ? "exploring" : "selected",
    };
  } else if (step.kind === "context" && step.field) {
    if (step.field === "hybrid_model") {
      contextPartial = {
        ...contextPartial,
        hybrid_model: /yes|hybrid|part|both|split|1-|2 day|keep clinical/i.test(trimmed),
        clinical_footprint:
          /yes|hybrid|part|both|split|1-|2 day|keep clinical/i.test(trimmed)
            ? trimmed
            : contextPartial.clinical_footprint,
      };
    } else {
      contextPartial = { ...contextPartial, [step.field]: trimmed };
    }
  }

  const nextIdx = session.step_index + 1;
  const nextStep = CAREER_DIRECTION_STEPS[nextIdx];

  if (!nextStep) {
    const thesis = thesisPartial as CareerThesis;
    const context: CareerPivotContext = {
      ...contextPartial,
      intentional_framing: thesis.sentence ?? contextPartial.intentional_framing,
      captured_at: new Date().toISOString(),
    } as CareerPivotContext;
    const cleared = clearCareerPivotSession(input.meta);
    return {
      meta: { ...cleared, career_thesis: thesis, career_pivot_context: context },
      response: `Career direction saved${thesis.sentence ? ` — *"${thesis.sentence}"*` : ""}.

I'll translate your clinical work for outsider audiences and help with resume, cover letter, or portfolio formats — not a 20-page CV.

Ready to translate a specific experience, or start path-specific quarterly capture?`,
      suggested_actions: [
        { action: "Translate an experience", url: "/app/objective?tab=activities" },
        { action: "Build pivot narrative", url: "/app/output" },
      ],
      complete: true,
    };
  }

  const nextInput = { thesis: thesisPartial, context: contextPartial };
  let response = nextStep.prompt(nextInput);
  if (step.kind === "thesis_confirm") {
    response = `Got it — I'll use that as your career direction.\n\n${response}`;
  } else if (step.kind !== "pathways") {
    response = `Got it.\n\n${response}`;
  }

  return {
    meta: {
      ...input.meta,
      career_pivot_session: {
        ...session,
        step_index: nextIdx,
        partial: contextPartial,
        thesis_partial: thesisPartial,
      },
      ...(thesisPartial.confidence === "confirmed" ? { career_thesis: thesisPartial as CareerThesis } : {}),
    },
    response,
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
    input.meta.career_thesis?.proposed_paths?.[0] ??
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

  const path =
    input.meta.career_pivot_context?.target_path ??
    input.meta.career_thesis?.proposed_paths?.[0] ??
    "industry_pharma";
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
    response: `Translation saved. I'll use this when generating your resume or pivot letter.`,
    suggested_actions: [
      { action: "Translate another experience", url: "/app/objective?tab=activities" },
      { action: "Build pivot narrative", url: "/app/output" },
    ],
    complete: true,
  };
}

export function buildCareerTranslationFollowUp(clinicalExperience: string, path: NonTraditionalTargetPath): string {
  return `${buildClinicalToTargetTranslationPrompt(clinicalExperience, path)}

In your own words: how would you describe the impact of "${clinicalExperience}" to someone outside medicine? Use STAR framing — situation, action with scope/scale, result. Include numbers only if you can verify them.`;
}

export function buildCareerPivotMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.career_pivot_session;
  if (!session) return "";
  const step = CAREER_DIRECTION_STEPS[session.step_index];
  if (!step) return "";
  const input = stepInput(session);
  return `Career direction onboarding — step ${session.step_index + 1}/${CAREER_DIRECTION_STEPS.length}.
Thesis-first: build and confirm a one-sentence career direction before suggesting paths.
Use solution-focused questions (what they want to move toward). Never ask what is wrong with medicine or why they want to leave.
Never say GROW, Venn, thesis framework, or study names.
Current prompt: ${step.prompt(input)}`;
}

export function buildPivotQuarterlyMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.pivot_quarterly_session;
  if (!session) return "";
  const modules = PIVOT_QUARTERLY_BY_PATH[session.path];
  const mod = modules[session.module_index];
  return mod ? `Pivot quarterly — ${session.path}: ${mod.prompt}` : "";
}
