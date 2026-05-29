import type { AppUser } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { ANNUAL_REFRESH_MODULES } from "@/lib/v2/annual-refresh";
import { QUARTERLY_MODULES } from "@/lib/v2/quarterly-pulse";
import {
  advanceAnnualRefreshSession,
  buildAnnualModulePrompt,
  currentAnnualModule,
  initAnnualRefreshSession,
  isAnnualModuleAdvanceMessage,
} from "@/lib/v2/annual-mak-flow";
import {
  advanceQuarterlyPulseSession,
  buildQuarterlyModulePrompt,
  currentQuarterlyModule,
  initQuarterlyPulseSession,
  isQuarterlyModuleAdvanceMessage,
} from "@/lib/v2/quarterly-mak-flow";
import {
  annualModuleReady,
  captureAnnualFromMessage,
  captureQuarterlyFromMessage,
  mergeAnnualSessionAnswers,
  mergeQuarterlySessionAnswers,
  quarterlyModuleReady,
} from "@/lib/v2/touchpoint-mak-capture";
import {
  buildAnnualCheckinSummaryBullets,
  buildQuarterlyCheckinSummaryBullets,
  formatSummaryConfirmPrompt,
  parseSummaryConfirmIntent,
} from "@/lib/v2/checkin-summary-confirm";
import {
  submitAnnualRefresh,
  submitQuarterlyPulse,
  type TouchpointSubmitResult,
} from "@/lib/v2/touchpoint-submit";

export type TouchpointMakTurnResult = {
  meta: OnboardingMetadata;
  advanced: boolean;
  submitted: TouchpointSubmitResult | null;
  nextPrompt: string | null;
};

function sessionAnswers(meta: OnboardingMetadata) {
  return meta.touchpoint_session_answers ?? [];
}

export async function processQuarterlyMakTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  userId: string;
  email: string;
  demo: boolean;
  user: AppUser;
  setting: AppUser["practice_setting"];
}): Promise<TouchpointMakTurnResult> {
  const confirmIntent = parseSummaryConfirmIntent(input.message);
  if (
    input.meta.pending_checkin_summary_kind === "quarterly" &&
    input.meta.pending_checkin_summary?.length
  ) {
    const answers = sessionAnswers(input.meta) as import("@/lib/v2/quarterly-pulse").PulseAnswer[];
    if (confirmIntent === "yes") {
      const submitted = await submitQuarterlyPulse({
        userId: input.userId,
        email: input.email,
        demo: input.demo,
        user: input.user,
        meta: {
          ...input.meta,
          pending_checkin_summary: undefined,
          pending_checkin_summary_kind: undefined,
        },
        answers,
      });
      return {
        meta: {
          ...submitted.meta,
          checkin_summary_confirmed_at: new Date().toISOString(),
        },
        advanced: true,
        submitted,
        nextPrompt: null,
      };
    }
    if (confirmIntent === "change" || confirmIntent === "not_quite") {
      return {
        meta: {
          ...input.meta,
          pending_checkin_summary: undefined,
          pending_checkin_summary_kind: undefined,
        },
        advanced: false,
        submitted: null,
        nextPrompt:
          confirmIntent === "change"
            ? "Tell me what to change in the summary — I'll read it back when we're aligned."
            : "No problem — what should I adjust before we save this check-in?",
      };
    }
  }

  let meta = input.meta.quarterly_pulse_session
    ? input.meta
    : initQuarterlyPulseSession({
        ...input.meta,
        touchpoint_session_mode: "quarterly",
        touchpoint_session_answers: [],
      });

  const now = new Date().toISOString();
  const activeModule = currentQuarterlyModule(meta);
  if (!activeModule) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  const captured = captureQuarterlyFromMessage(activeModule.id, input.message, now);
  const answers = mergeQuarterlySessionAnswers(
    sessionAnswers(meta) as import("@/lib/v2/quarterly-pulse").PulseAnswer[],
    captured,
  );

  meta = { ...meta, touchpoint_session_answers: answers };

  const shouldAdvance =
    isQuarterlyModuleAdvanceMessage(input.message) || quarterlyModuleReady(activeModule.id, answers);

  if (!shouldAdvance) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  meta = advanceQuarterlyPulseSession(meta);
  const session = meta.quarterly_pulse_session!;
  const allDone = session.completed_module_ids.length >= QUARTERLY_MODULES.length;

  if (allDone) {
    const bullets = buildQuarterlyCheckinSummaryBullets(input.user, answers);
    return {
      meta: {
        ...meta,
        pending_checkin_summary: bullets,
        pending_checkin_summary_kind: "quarterly",
      },
      advanced: true,
      submitted: null,
      nextPrompt: formatSummaryConfirmPrompt(bullets),
    };
  }

  const nextModule = currentQuarterlyModule(meta);
  return {
    meta,
    advanced: true,
    submitted: null,
    nextPrompt: nextModule
      ? buildQuarterlyModulePrompt(nextModule, input.setting ?? "Academic")
      : null,
  };
}

export async function processAnnualMakTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  userId: string;
  email: string;
  demo: boolean;
  user: AppUser;
}): Promise<TouchpointMakTurnResult> {
  const confirmIntent = parseSummaryConfirmIntent(input.message);
  if (
    input.meta.pending_checkin_summary_kind === "annual" &&
    input.meta.pending_checkin_summary?.length
  ) {
    const answers = sessionAnswers(input.meta) as import("@/lib/v2/annual-refresh").AnnualRefreshAnswer[];
    if (confirmIntent === "yes") {
      const submitted = await submitAnnualRefresh({
        userId: input.userId,
        email: input.email,
        demo: input.demo,
        user: input.user,
        meta: {
          ...input.meta,
          pending_checkin_summary: undefined,
          pending_checkin_summary_kind: undefined,
        },
        answers,
      });
      return {
        meta: {
          ...submitted.meta,
          checkin_summary_confirmed_at: new Date().toISOString(),
        },
        advanced: true,
        submitted,
        nextPrompt: null,
      };
    }
    if (confirmIntent === "change" || confirmIntent === "not_quite") {
      return {
        meta: {
          ...input.meta,
          pending_checkin_summary: undefined,
          pending_checkin_summary_kind: undefined,
        },
        advanced: false,
        submitted: null,
        nextPrompt:
          confirmIntent === "change"
            ? "Tell me what to change in the summary — I'll read it back when we're aligned."
            : "No problem — what should I adjust before we save this yearly check-in?",
      };
    }
  }

  let meta = input.meta.annual_refresh_session
    ? input.meta
    : initAnnualRefreshSession({
        ...input.meta,
        touchpoint_session_mode: "annual",
        touchpoint_session_answers: [],
      });

  const now = new Date().toISOString();
  const activeModule = currentAnnualModule(meta);
  if (!activeModule) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  const captured = captureAnnualFromMessage(activeModule.id, input.message, now);
  const answers = mergeAnnualSessionAnswers(
    sessionAnswers(meta) as import("@/lib/v2/annual-refresh").AnnualRefreshAnswer[],
    captured,
  );

  meta = { ...meta, touchpoint_session_answers: answers };

  const shouldAdvance =
    isAnnualModuleAdvanceMessage(input.message) || annualModuleReady(activeModule.id, answers);

  if (!shouldAdvance) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  meta = advanceAnnualRefreshSession(meta);
  const session = meta.annual_refresh_session!;
  const allDone = session.completed_module_ids.length >= ANNUAL_REFRESH_MODULES.length;

  if (allDone) {
    const annualAnswers = answers as import("@/lib/v2/annual-refresh").AnnualRefreshAnswer[];
    const bullets = buildAnnualCheckinSummaryBullets(input.user, annualAnswers);
    return {
      meta: {
        ...meta,
        pending_checkin_summary: bullets,
        pending_checkin_summary_kind: "annual",
      },
      advanced: true,
      submitted: null,
      nextPrompt: formatSummaryConfirmPrompt(bullets),
    };
  }

  const nextModule = currentAnnualModule(meta);
  return {
    meta,
    advanced: true,
    submitted: null,
    nextPrompt: nextModule ? buildAnnualModulePrompt(nextModule) : null,
  };
}
