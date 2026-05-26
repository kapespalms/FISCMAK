import {
  buildKpAdminTrackingSnapshot,
  type KpAdminTrackingSnapshot,
} from "@/lib/v2/kp-admin-tracking";
import {
  buildMakDiscrepancyCoachingHints,
  formatMakInternalCoachingContext,
} from "@/lib/v2/mak-coaching-prompts";
import {
  computeInternalCoachingSignals,
  inferMakCoachingEscalationLevel,
  type InternalCoachingSignals,
  type MakCoachingEscalationLevel,
} from "@/lib/v2/internal-coaching-signals";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { CareerAssessment } from "@/lib/v2/types";
import {
  inferTrajectoryState,
  type TrajectoryState,
} from "@/lib/v2/trajectory-state";
import type {
  EscalationProgressionRecord,
  MeceBucket,
} from "@/lib/v2/escalation-protocols";

export type MakInternalCoachingBundle = {
  signals: InternalCoachingSignals;
  escalation_level: MakCoachingEscalationLevel;
  hints: ReturnType<typeof buildMakDiscrepancyCoachingHints>;
  context_block: string;
};

export function buildMakInternalCoachingBundle(
  cvText: string | null | undefined,
  assessments: CareerAssessment[],
  meta: Pick<
    OnboardingMetadata,
    "low_alignment_quarters" | "stalled_goal_quarters" | "computed_at"
  >,
): MakInternalCoachingBundle {
  const signals = computeInternalCoachingSignals(cvText, assessments);
  const escalation_level = inferMakCoachingEscalationLevel(meta, signals);
  const hints = buildMakDiscrepancyCoachingHints(signals, escalation_level);
  const context_block = formatMakInternalCoachingContext(signals, hints, escalation_level);

  return { signals, escalation_level, hints, context_block };
}

/** KP Admin dev mirror of Mak internal inputs. */
export function buildKpAdminMakSignalPreview(
  cvText: string | null | undefined,
  assessments: CareerAssessment[],
  meta: Pick<
    OnboardingMetadata,
    "low_alignment_quarters" | "stalled_goal_quarters" | "computed_at"
  >,
): {
  tracking: KpAdminTrackingSnapshot;
  mak_bundle: MakInternalCoachingBundle;
} {
  const tracking = buildKpAdminTrackingSnapshot(cvText, assessments);
  const mak_bundle = buildMakInternalCoachingBundle(cvText, assessments, meta);
  return { tracking, mak_bundle };
}

export type SanitizedCoachingSignals = {
  invisibleWorkTheme?: string;
  portfolioGapTheme?: string;
  energyAlignmentTheme?: string;
  workloadBurdenTheme?: string;
  burnoutSustainabilityTheme?: string;
};

export type MakPhysicianMentorDadBundle = MakInternalCoachingBundle & {
  trajectory_state?: TrajectoryState;
  trajectory_coaching_signals?: string[];
  mece_suggestion?: MeceBucket;
  mece_entry_points?: string[];
  sanitized_signals?: SanitizedCoachingSignals;
  escalation_advancement?: ReturnType<typeof inferEscalationAdvancementDecision>;
  monthly_checkin_due?: boolean;
  safe_export?: ReturnType<typeof sanitizeForExternalSync>;
};

export function isPhysicianCoachEnhancedEnabled(): boolean {
  return process.env.MAK_COACHING_ENHANCED !== "false";
}

export function buildMakPhysicianMentorDadBundle(input: {
  cvText: string | null | undefined;
  assessments: CareerAssessment[];
  meta: Pick<
    OnboardingMetadata,
    "low_alignment_quarters" | "stalled_goal_quarters" | "computed_at"
  >;
  metricSnapshots?: Array<{ timestamp: Date; percentile: number }>;
  recentRotationChange?: boolean;
  burnoutElevated?: boolean;
  lastUserMessage?: string;
  escalationProgressionRecord?: EscalationProgressionRecord;
  lastMonthlyCheckInDate?: Date;
}): MakPhysicianMentorDadBundle {
  const baseBundle = buildMakInternalCoachingBundle(input.cvText, input.assessments, input.meta);

  if (!isPhysicianCoachEnhancedEnabled()) {
    return baseBundle;
  }

  const trajectoryResult = inferTrajectoryState({
    recentMetricSnapshots: input.metricSnapshots,
    workloadRecognitionGap: baseBundle.signals.workload_recognition_gap,
    serviceFootprintBand: baseBundle.signals.service_footprint_band,
    recentRotationChange: input.recentRotationChange,
    burnoutElevated: input.burnoutElevated,
  });

  const meceClassification = inferMeceSuggestion({
    userMessage: input.lastUserMessage,
    signals: baseBundle.signals,
  });

  const sanitized = sanitizeCoachingSignalsForLLM(baseBundle.signals, input.burnoutElevated);

  const escalationAdvancement = input.escalationProgressionRecord
    ? inferEscalationAdvancementDecision(
        baseBundle.escalation_level,
        input.escalationProgressionRecord,
      )
    : undefined;

  return {
    ...baseBundle,
    trajectory_state: trajectoryResult.state,
    trajectory_coaching_signals: trajectoryResult.coachingSignals,
    mece_suggestion: meceClassification.bucket,
    mece_entry_points: meceClassification.entryPoints,
    sanitized_signals: sanitized,
    escalation_advancement: escalationAdvancement,
    monthly_checkin_due: isMonthlyCheckInDue(input.lastMonthlyCheckInDate),
    safe_export: sanitizeForExternalSync(baseBundle.signals, input.burnoutElevated),
  };
}

export function sanitizeCoachingSignalsForLLM(
  signals: InternalCoachingSignals,
  burnoutElevated?: boolean,
): SanitizedCoachingSignals {
  const output: SanitizedCoachingSignals = {};

  if (signals.available && signals.s_index != null && signals.s_index > 0) {
    if (signals.s_index >= 60) {
      output.invisibleWorkTheme =
        "Substantial invisible work—mentoring, committee service, informal teaching—may be under-documented.";
    } else if (signals.s_index >= 35) {
      output.invisibleWorkTheme =
        "Meaningful invisible work contributions beyond documented activities.";
    } else {
      output.invisibleWorkTheme = "Some invisible work themes appear in their portfolio text.";
    }
  }

  if (signals.workload_recognition_gap === "elevated") {
    output.workloadBurdenTheme =
      "Workload may exceed formal recognition — significant unrecognized professional load.";
  } else if (signals.workload_recognition_gap === "moderate") {
    output.workloadBurdenTheme = "Moderate gap between effort invested and visible recognition.";
  }

  if (signals.portfolio_documentation_gap) {
    output.portfolioGapTheme =
      "Portfolio may underrepresent service, mentoring, or committee contributions.";
  } else if (
    signals.promotion_aligned_pct != null &&
    signals.promotion_aligned_pct < 45 &&
    signals.service_footprint_band !== "minimal"
  ) {
    output.portfolioGapTheme =
      "Some contributions worth exploring for documentation alignment.";
  }

  if (signals.service_footprint_band === "strong") {
    output.energyAlignmentTheme =
      "Strong service footprint — explore whether energizing work is getting formal visibility.";
  } else if (signals.service_footprint_band === "minimal") {
    output.energyAlignmentTheme = "Service footprint appears minimal in available evidence.";
  }

  if (burnoutElevated) {
    output.burnoutSustainabilityTheme =
      "Professional sustainability: strain indicators suggest structured support may help.";
  }

  return output;
}

export function inferMeceSuggestion(input: {
  userMessage?: string;
  signals: InternalCoachingSignals;
}): { bucket?: MeceBucket; entryPoints: string[] } {
  const msg = (input.userMessage ?? "").toLowerCase();
  const entryPoints: string[] = [];
  let bucket: MeceBucket | undefined;

  if (
    msg.includes("exhausted") ||
    msg.includes("burned out") ||
    msg.includes("lost") ||
    msg.includes("meaning") ||
    msg.includes("numb") ||
    msg.includes("passion")
  ) {
    bucket = "internal_energy";
    entryPoints.push(
      "Help them reconnect with their original why",
      "Validate the struggle without excusing unhealthy patterns",
      "Find one source of renewal",
    );
  }

  if (
    msg.includes("charting") ||
    msg.includes("prior auth") ||
    msg.includes("system") ||
    msg.includes("workflow") ||
    msg.includes("admin") ||
    msg.includes("invisible") ||
    input.signals.workload_recognition_gap === "elevated" ||
    (input.signals.iwq != null && input.signals.iwq >= 60)
  ) {
    bucket = "institutional_friction";
    entryPoints.push(
      "Normalize: this is often systemic, not personal failure",
      "Isolate one specific wasteful task",
      "Propose a micro-fix: automate, delegate, or boundary-set",
    );
  }

  if (
    msg.includes("isolated") ||
    msg.includes("alone") ||
    msg.includes("mentor") ||
    msg.includes("sponsor") ||
    msg.includes("no one") ||
    msg.includes("toxic") ||
    msg.includes("unsupported")
  ) {
    bucket = "relational_capital";
    entryPoints.push(
      "Identify the missing relationship (mentor, sponsor, safe peer)",
      "Name what that person would offer them",
      "Guide toward one specific conversation this week",
    );
  }

  if (!bucket) {
    entryPoints.push("Listen for the core problem beneath the surface");
  }

  return { bucket, entryPoints };
}

export function inferEscalationAdvancementDecision(
  currentLevel: MakCoachingEscalationLevel,
  progressionRecord: EscalationProgressionRecord,
): {
  nextLevel: MakCoachingEscalationLevel;
  shouldAdvance: boolean;
  reason?: string;
} {
  const recentEngagement = progressionRecord.engagementSignals.filter(
    (s) => (Date.now() - s.date.getTime()) / (1000 * 60 * 60 * 24) <= 30,
  );

  if (
    currentLevel === 1 &&
    progressionRecord.monthsAtLevel >= 1 &&
    recentEngagement.some((s) =>
      ["ambient_mention", "gap_articulation"].includes(s.signal),
    )
  ) {
    return {
      nextLevel: 2,
      shouldAdvance: true,
      reason: "Physician engaged with ambient awareness; ready for focused reflection",
    };
  }

  if (
    currentLevel === 2 &&
    progressionRecord.monthsAtLevel >= 1 &&
    recentEngagement.some((s) => s.signal === "gap_articulation")
  ) {
    return {
      nextLevel: 3,
      shouldAdvance: true,
      reason: "Physician articulated the gap; ready for actionable coaching",
    };
  }

  if (
    currentLevel === 3 &&
    progressionRecord.monthsAtLevel >= 1 &&
    recentEngagement.filter((s) => s.signal === "dismissal").length >= 2
  ) {
    return {
      nextLevel: 4,
      shouldAdvance: true,
      reason: "Repeated dismissals; escalate to wellness-integrated coaching",
    };
  }

  return { nextLevel: currentLevel, shouldAdvance: false };
}

export function isMonthlyCheckInDue(lastCheckInDate?: Date): boolean {
  if (!lastCheckInDate) return false;
  const days = (Date.now() - lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 30;
}

export function sanitizeForExternalSync(
  signals: InternalCoachingSignals,
  burnoutElevated?: boolean,
): {
  invisibleWorkTheme?: string;
  portfolioAlignmentTheme?: string;
  energySustainabilityTheme?: string;
  recommendedFocus?: MeceBucket;
} {
  const sanitized = sanitizeCoachingSignalsForLLM(signals, burnoutElevated);
  return {
    invisibleWorkTheme: sanitized.invisibleWorkTheme,
    portfolioAlignmentTheme: sanitized.portfolioGapTheme,
    energySustainabilityTheme:
      sanitized.energyAlignmentTheme ?? sanitized.burnoutSustainabilityTheme,
    recommendedFocus: deriveCoachingFocus(signals, burnoutElevated),
  };
}

function deriveCoachingFocus(
  signals: InternalCoachingSignals,
  burnoutElevated?: boolean,
): MeceBucket {
  if (signals.workload_recognition_gap === "elevated") {
    return "institutional_friction";
  }
  if (burnoutElevated) {
    return "internal_energy";
  }
  return "relational_capital";
}

export function buildPhysicianMentorDadCoachingContextBlock(
  bundle: MakPhysicianMentorDadBundle,
): string {
  if (!isPhysicianCoachEnhancedEnabled()) {
    return bundle.context_block;
  }

  const blocks: string[] = [];

  if (bundle.sanitized_signals) {
    const s = bundle.sanitized_signals;
    if (s.invisibleWorkTheme) blocks.push(`Invisible work theme: ${s.invisibleWorkTheme}`);
    if (s.portfolioGapTheme) blocks.push(`Portfolio alignment: ${s.portfolioGapTheme}`);
    if (s.workloadBurdenTheme) blocks.push(`Workload burden: ${s.workloadBurdenTheme}`);
    if (s.energyAlignmentTheme) blocks.push(`Energy alignment: ${s.energyAlignmentTheme}`);
    if (s.burnoutSustainabilityTheme) {
      blocks.push(`Sustainability: ${s.burnoutSustainabilityTheme}`);
    }
  }

  if (bundle.trajectory_state && bundle.trajectory_coaching_signals?.length) {
    blocks.push(
      `Trajectory (${bundle.trajectory_state.replace(/_/g, " ")}): ${bundle.trajectory_coaching_signals.join(" · ")}`,
    );
  }

  if (bundle.mece_suggestion && bundle.mece_entry_points?.length) {
    blocks.push(
      `MECE hint (${bundle.mece_suggestion.replace(/_/g, " ")}): ${bundle.mece_entry_points.join(" · ")}`,
    );
  }

  if (bundle.monthly_checkin_due) {
    blocks.push(
      "Monthly check-in due: energy mapping → invisible work audit → relational check-in → synthesis.",
    );
  }

  const enhanced = blocks.join("\n");
  if (!enhanced) return bundle.context_block;

  return [
    "CONFIDENTIAL COACHING INPUT (qualitative themes only — never name S-Index, IWQ, or numeric scores):",
    enhanced,
    "",
    bundle.context_block,
  ].join("\n");
}

export function auditContextBlockForMetricLeakage(contextBlock: string): {
  safe: boolean;
  detectedLeakages: string[];
} {
  const leakagePatterns = [
    /\bs_index\b/i,
    /\bs-index\b/i,
    /\biwq\b/i,
    /\bportfolio_gap\b/i,
    /\bburnout_risk\b/i,
    /\bgap_percent\b/i,
  ];

  const detectedLeakages = leakagePatterns
    .filter((pattern) => pattern.test(contextBlock))
    .map((pattern) => pattern.source);

  return { safe: detectedLeakages.length === 0, detectedLeakages };
}
