import type { AppUser } from "@/lib/v2/types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export const ONBOARDING_STATUSES = [
  "NOT_STARTED",
  "STEP_1_COMPLETE",
  "STEP_2_COMPLETE",
  "FULLY_ONBOARDED",
] as const;

export type OnboardingStatus = (typeof ONBOARDING_STATUSES)[number];

export type OnboardingWizardStep = "welcome" | "profile" | "documents" | "reconcile" | "instruments";

export function isOnboardingStatus(value: unknown): value is OnboardingStatus {
  return typeof value === "string" && ONBOARDING_STATUSES.includes(value as OnboardingStatus);
}

/** Resolve status from explicit column or legacy tier flags. */
export function deriveOnboardingStatus(
  user: Pick<AppUser, "onboarding_status" | "tier1_complete" | "tier2_complete" | "tier3_complete">,
): OnboardingStatus {
  if (user.onboarding_status && isOnboardingStatus(user.onboarding_status)) {
    return user.onboarding_status;
  }
  if (user.tier3_complete) return "FULLY_ONBOARDED";
  if (user.tier2_complete) return "STEP_2_COMPLETE";
  if (user.tier1_complete) return "STEP_1_COMPLETE";
  return "NOT_STARTED";
}

export type OnboardingResumeInput = Pick<
  AppUser,
  | "tier1_complete"
  | "tier2_complete"
  | "tier3_complete"
  | "onboarding_status"
  | "current_onboarding_step"
  | "cv_uploaded"
  | "name"
  | "base_specialty"
>;

/** Map user state to the onboarding ?step= param (existing Touchpoint1 routes). */
export function resolveOnboardingWizardStep(
  user: OnboardingResumeInput,
  pendingReconcile = 0,
): OnboardingWizardStep {
  const status = deriveOnboardingStatus(user);
  if (status === "FULLY_ONBOARDED" || user.tier3_complete) {
    return "instruments";
  }

  const resumeStep = user.current_onboarding_step;
  const skipWelcome =
    status !== "NOT_STARTED" ||
    resumeStep === 1 ||
    Boolean(user.name?.trim()) ||
    Boolean(user.base_specialty);

  if (!user.tier1_complete) {
    if (skipWelcome || resumeStep === 1) return "profile";
    return "welcome";
  }

  if (user.cv_uploaded && pendingReconcile > 0 && !user.tier2_complete) {
    // Only force reconcile if the user hasn't advanced past the documents step.
    // current_onboarding_step 3 means the user reached instruments — they chose
    // to defer per-item review to the in-app pending tray.
    if (!user.current_onboarding_step || user.current_onboarding_step < 3) {
      return "reconcile";
    }
  }
  if (!user.tier2_complete) {
    return "documents";
  }
  return "instruments";
}

/** Merge invite/program params from preferredNext into resolved onboarding path (keeps step=). */
export function mergeOnboardingRedirectPath(
  resolvedPath: string,
  preferredNext?: string | null,
): string {
  if (!preferredNext?.startsWith("/app/onboarding")) {
    return resolvedPath;
  }
  try {
    const preferred = new URL(preferredNext, "https://www.fiscmak.com");
    const target = new URL(resolvedPath, "https://www.fiscmak.com");
    preferred.searchParams.forEach((value, key) => {
      if (key !== "step") {
        target.searchParams.set(key, value);
      }
    });
    return `${target.pathname}${target.search}`;
  } catch {
    return resolvedPath;
  }
}

/** Post-login / post-auth redirect target. */
export function resolvePostLoginPath(
  user: AppUser,
  preferredNext?: string | null,
): string {
  const status = deriveOnboardingStatus(user);

  if (status === "FULLY_ONBOARDED" || user.tier3_complete) {
    if (preferredNext?.startsWith("/app/") && !preferredNext.startsWith("/app/onboarding")) {
      return preferredNext;
    }
    return "/app/dashboard";
  }

  const meta = getOnboardingMetadata(user);
  const pendingReconcile = (meta.reconciliation ?? []).filter((r) => r.status === "pending").length;
  const step = resolveOnboardingWizardStep(user, pendingReconcile);
  const resolved = `/app/onboarding?step=${step}`;

  if (preferredNext?.startsWith("/app/onboarding")) {
    return mergeOnboardingRedirectPath(resolved, preferredNext);
  }

  return resolved;
}

export function markDocumentsUploadProgress(): Pick<
  AppUser,
  "onboarding_status" | "current_onboarding_step"
> {
  return { onboarding_status: "STEP_2_COMPLETE", current_onboarding_step: 3 };
}

export function onboardingProgressPatch(input: {
  tier1_complete?: boolean;
  tier2_complete?: boolean;
  tier3_complete?: boolean;
  current_onboarding_step?: number | null;
}): Pick<AppUser, "onboarding_status" | "current_onboarding_step"> {
  if (input.tier3_complete) {
    return { onboarding_status: "FULLY_ONBOARDED", current_onboarding_step: null };
  }
  if (input.tier2_complete) {
    return { onboarding_status: "STEP_2_COMPLETE", current_onboarding_step: 3 };
  }
  if (input.tier1_complete) {
    return { onboarding_status: "STEP_1_COMPLETE", current_onboarding_step: 2 };
  }
  if (input.current_onboarding_step != null) {
    return { current_onboarding_step: input.current_onboarding_step };
  }
  return {};
}
