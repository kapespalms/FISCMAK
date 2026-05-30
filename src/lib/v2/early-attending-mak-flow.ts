import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { PromotionDomain } from "@/lib/v2/mak-conversation-models";
import {
  ATTENDING_QUARTERLY_MODULES,
  PROMOTION_CONTEXT_STEPS,
  buildAttendingQuarterlyIntro,
  buildImpactTranslationFollowUp,
  buildPromotionContextIntro,
  buildPromotionReadinessIntro,
  type AttendingQuarterlyCapture,
  type PromotionContext,
  type PromotionReadinessSnapshot,
} from "@/lib/v2/mak-conversation-models";

export type PromotionContextSession = {
  step_index: number;
  started_at: string;
  partial?: Partial<PromotionContext>;
};

export type AttendingQuarterlySession = {
  module_index: number;
  started_at: string;
  captures: Partial<Record<string, string>>;
  is_deep_reflection: boolean;
};

export type ImpactTranslationSession = {
  activity_logged: string;
  domain?: PromotionDomain;
  step: "awaiting_impact";
  started_at: string;
};

export function getPromotionContext(meta: OnboardingMetadata): PromotionContext | null {
  return meta.promotion_context ?? null;
}

export function initPromotionContextSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    promotion_context_session: {
      step_index: 0,
      started_at: new Date().toISOString(),
      partial: meta.promotion_context ?? {},
    },
  };
}

export function initAttendingQuarterlySession(
  meta: OnboardingMetadata,
  deepReflection = false,
): OnboardingMetadata {
  return {
    ...meta,
    attending_quarterly_session: {
      module_index: 0,
      started_at: new Date().toISOString(),
      captures: {},
      is_deep_reflection: deepReflection,
    },
  };
}

export function initImpactTranslationSession(
  meta: OnboardingMetadata,
  activityLogged: string,
  domain?: PromotionDomain,
): OnboardingMetadata {
  return {
    ...meta,
    impact_translation_session: {
      activity_logged: activityLogged,
      domain,
      step: "awaiting_impact",
      started_at: new Date().toISOString(),
    },
  };
}

export function clearPromotionContextSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { promotion_context_session: _, ...rest } = meta;
  return rest;
}

export function clearAttendingQuarterlySession(meta: OnboardingMetadata): OnboardingMetadata {
  const { attending_quarterly_session: _, ...rest } = meta;
  return rest;
}

export function clearImpactTranslationSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { impact_translation_session: _, ...rest } = meta;
  return rest;
}

export type AttendingFlowTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  complete: boolean;
};

export function buildPromotionContextMakSystemContext(
  meta: OnboardingMetadata,
): string {
  const session = meta.promotion_context_session;
  if (!session) return "";
  const step = PROMOTION_CONTEXT_STEPS[session.step_index];
  if (!step) return "Promotion context complete.";
  return `Promotion context setup — question ${session.step_index + 1}/${PROMOTION_CONTEXT_STEPS.length}.
Field: ${step.field}
Ask: ${step.prompt(session.partial ?? {})}`;
}

export function buildAttendingQuarterlyMakSystemContext(
  meta: OnboardingMetadata,
): string {
  const session = meta.attending_quarterly_session;
  if (!session) return "";
  const modules = session.is_deep_reflection
    ? ATTENDING_QUARTERLY_MODULES.filter((m) => m.deep_only)
    : ATTENDING_QUARTERLY_MODULES.filter((m) => !m.deep_only);
  const mod = modules[session.module_index];
  if (!mod) return "Quarterly capture complete.";
  return `Attending quarterly check-in — module "${mod.id}" (${session.module_index + 1}/${modules.length}).
${mod.prompt}`;
}

export function processPromotionContextTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): AttendingFlowTurnResult {
  const session = input.meta.promotion_context_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildPromotionContextIntro(),
      suggested_actions: [],
      complete: false,
    };
  }

  const stepIdx = session.step_index;
  const step = PROMOTION_CONTEXT_STEPS[stepIdx];
  if (!step) {
    return {
      meta: clearPromotionContextSession(input.meta),
      response: "Promotion context is set. I'll use your track and timeline for readiness reviews and dossier drafting.",
      suggested_actions: [
        { action: "Run promotion readiness audit", url: "/app/output" },
        { action: "Start quarterly capture", url: "/app/subjective" },
      ],
      complete: true,
    };
  }

  const partial = { ...(session.partial ?? {}), [step.field]: input.message.trim() };
  const nextIdx = stepIdx + 1;
  const nextStep = PROMOTION_CONTEXT_STEPS[nextIdx];

  if (!nextStep) {
    const context: PromotionContext = {
      ...partial,
      captured_at: new Date().toISOString(),
    } as PromotionContext;
    const cleared = clearPromotionContextSession(input.meta);
    return {
      meta: { ...cleared, promotion_context: context },
      response: `Promotion context saved — **${context.promotion_track ?? "track TBD"}**, target **${context.target_rank ?? "next rank"}** in **${context.promotion_timeline ?? "your timeline"}**.

I'll map future captures to scholarship, teaching, clinical, service, and national reputation domains. Ready for a quarterly accomplishment check-in?`,
      suggested_actions: [
        { action: "Begin quarterly capture", url: "/app/subjective" },
        { action: "Promotion readiness audit", url: "/app/output" },
      ],
      complete: true,
    };
  }

  return {
    meta: {
      ...input.meta,
      promotion_context_session: { ...session, step_index: nextIdx, partial },
    },
    response: `Got it.\n\n${nextStep.prompt(partial)}`,
    suggested_actions: [],
    complete: false,
  };
}

export function processAttendingQuarterlyTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): AttendingFlowTurnResult {
  const session = input.meta.attending_quarterly_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildAttendingQuarterlyIntro(false),
      suggested_actions: [],
      complete: false,
    };
  }

  const modules = session.is_deep_reflection
    ? ATTENDING_QUARTERLY_MODULES.filter((m) => m.deep_only)
    : ATTENDING_QUARTERLY_MODULES.filter((m) => !m.deep_only);
  const current = modules[session.module_index];
  if (!current) {
    return {
      meta: clearAttendingQuarterlySession(input.meta),
      response: "Quarterly capture complete.",
      suggested_actions: [{ action: "View Career Data", url: "/app/objective" }],
      complete: true,
    };
  }

  const captures = { ...session.captures, [current.id]: input.message.trim() };
  const nextIndex = session.module_index + 1;
  const nextMod = modules[nextIndex];

  if (!nextMod) {
    const entry: AttendingQuarterlyCapture = {
      id: crypto.randomUUID(),
      completed_at: new Date().toISOString(),
      quarter_label: new Date().toISOString().slice(0, 7),
      is_deep_reflection: session.is_deep_reflection,
      modules: Object.fromEntries(
        Object.entries(captures).filter(([, v]) => v != null),
      ) as Record<string, string>,
    };
    const entries = [...(input.meta.attending_quarterly_captures ?? []), entry];
    const cleared = clearAttendingQuarterlySession(input.meta);
    return {
      meta: { ...cleared, attending_quarterly_captures: entries },
      response: session.is_deep_reflection
        ? "Deep reflection saved. I'll use this for your promotion narrative and readiness audit."
        : "Quarterly accomplishments captured. Anything you logged that's still missing outcomes — we can translate impact next.",
      suggested_actions: [
        { action: "Promotion readiness audit", url: "/app/output" },
        { action: "Draft promotion narrative", url: "/app/output" },
      ],
      complete: true,
    };
  }

  return {
    meta: {
      ...input.meta,
      attending_quarterly_session: {
        ...session,
        module_index: nextIndex,
        captures,
      },
    },
    response: `Saved. Next:\n\n${nextMod.prompt}`,
    suggested_actions: [],
    complete: false,
  };
}

export function processImpactTranslationTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): AttendingFlowTurnResult {
  const session = input.meta.impact_translation_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildImpactTranslationFollowUp("your recent activity"),
      suggested_actions: [],
      complete: false,
    };
  }

  const translated = input.message.trim();
  const entries = [
    ...(input.meta.impact_translations ?? []),
    {
      id: crypto.randomUUID(),
      activity: session.activity_logged,
      domain: session.domain,
      impact_narrative: translated,
      captured_at: new Date().toISOString(),
    },
  ];

  return {
    meta: {
      ...clearImpactTranslationSession(input.meta),
      impact_translations: entries,
    },
    response: `Impact captured:\n\n"${translated}"\n\nThis is promotion-ready language — I'll use it in your dossier and CV bullets.`,
    suggested_actions: [{ action: "Draft promotion section", url: "/app/output" }],
    complete: true,
  };
}

export function buildPromotionReadinessMakSystemContext(
  meta: OnboardingMetadata,
): string {
  const ctx = meta.promotion_context;
  if (!ctx) return "Promotion context not set — suggest promotion_context flow first.";

  const captures = meta.attending_quarterly_captures ?? [];
  const impacts = meta.impact_translations ?? [];
  const recentModules = captures.slice(-2).flatMap((c) => Object.entries(c.modules ?? {}));

  return `Promotion readiness audit mode.
Track: ${ctx.promotion_track ?? "unknown"} | Target: ${ctx.target_rank ?? "unknown"} | Timeline: ${ctx.promotion_timeline ?? "unknown"}
Institution: ${ctx.institution_type ?? "unknown"}

Evaluate across five domains: scholarship, teaching, clinical excellence, service/leadership, national reputation.
Compare documented activities to typical ${ctx.promotion_track ?? "academic"} criteria.
Do NOT fabricate metrics — flag gaps and suggest concrete next steps.
Recent quarterly captures: ${recentModules.length ? recentModules.map(([k, v]) => `${k}: ${v}`).join("; ") : "none yet"}
Impact translations on file: ${impacts.length}`;
}

export function storePromotionReadinessSnapshot(
  meta: OnboardingMetadata,
  summary: string,
): OnboardingMetadata {
  const snapshot: PromotionReadinessSnapshot = {
    id: crypto.randomUUID(),
    generated_at: new Date().toISOString(),
    summary,
    track: meta.promotion_context?.promotion_track,
    target_rank: meta.promotion_context?.target_rank,
  };
  return {
    ...meta,
    promotion_readiness_snapshots: [...(meta.promotion_readiness_snapshots ?? []), snapshot],
  };
}
