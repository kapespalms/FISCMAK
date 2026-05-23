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
  let meta = input.meta.quarterly_pulse_session
    ? input.meta
    : initQuarterlyPulseSession({
        ...input.meta,
        touchpoint_session_mode: "quarterly",
        touchpoint_session_answers: [],
      });

  const now = new Date().toISOString();
  const module = currentQuarterlyModule(meta);
  if (!module) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  const captured = captureQuarterlyFromMessage(module.id, input.message, now);
  let answers = mergeQuarterlySessionAnswers(
    sessionAnswers(meta) as import("@/lib/v2/quarterly-pulse").PulseAnswer[],
    captured,
  );

  meta = { ...meta, touchpoint_session_answers: answers };

  const shouldAdvance =
    isQuarterlyModuleAdvanceMessage(input.message) || quarterlyModuleReady(module.id, answers);

  if (!shouldAdvance) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  meta = advanceQuarterlyPulseSession(meta);
  const session = meta.quarterly_pulse_session!;
  const allDone = session.completed_module_ids.length >= QUARTERLY_MODULES.length;

  if (allDone) {
    const submitted = await submitQuarterlyPulse({
      userId: input.userId,
      email: input.email,
      demo: input.demo,
      user: input.user,
      meta,
      answers: answers as import("@/lib/v2/quarterly-pulse").PulseAnswer[],
    });
    return {
      meta: submitted.meta,
      advanced: true,
      submitted,
      nextPrompt: null,
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
  let meta = input.meta.annual_refresh_session
    ? input.meta
    : initAnnualRefreshSession({
        ...input.meta,
        touchpoint_session_mode: "annual",
        touchpoint_session_answers: [],
      });

  const now = new Date().toISOString();
  const module = currentAnnualModule(meta);
  if (!module) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  const captured = captureAnnualFromMessage(module.id, input.message, now);
  let answers = mergeAnnualSessionAnswers(
    sessionAnswers(meta) as import("@/lib/v2/annual-refresh").AnnualRefreshAnswer[],
    captured,
  );

  meta = { ...meta, touchpoint_session_answers: answers };

  const shouldAdvance =
    isAnnualModuleAdvanceMessage(input.message) || annualModuleReady(module.id, answers);

  if (!shouldAdvance) {
    return { meta, advanced: false, submitted: null, nextPrompt: null };
  }

  meta = advanceAnnualRefreshSession(meta);
  const session = meta.annual_refresh_session!;
  const allDone = session.completed_module_ids.length >= ANNUAL_REFRESH_MODULES.length;

  if (allDone) {
    const submitted = await submitAnnualRefresh({
      userId: input.userId,
      email: input.email,
      demo: input.demo,
      user: input.user,
      meta,
      answers: answers as import("@/lib/v2/annual-refresh").AnnualRefreshAnswer[],
    });
    return {
      meta: submitted.meta,
      advanced: true,
      submitted,
      nextPrompt: null,
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
