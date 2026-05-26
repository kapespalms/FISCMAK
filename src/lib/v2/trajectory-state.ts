import type { InternalCoachingSignals } from "@/lib/v2/internal-coaching-signals";

export type TrajectoryState =
  | "acceleration"
  | "steady_growth"
  | "plateau"
  | "transition_dip"
  | "decline_draining";

export type TrajectoryInferenceInput = {
  recentMetricSnapshots?: Array<{ timestamp: Date; percentile: number }>;
  workloadRecognitionGap?: InternalCoachingSignals["workload_recognition_gap"];
  serviceFootprintBand?: InternalCoachingSignals["service_footprint_band"];
  recentRotationChange?: boolean;
  burnoutElevated?: boolean;
};

const TRAJECTORY_COACHING: Record<TrajectoryState, string[]> = {
  acceleration: [
    "Reinforce momentum — ask what's driving recent progress.",
    "Invite them to name one behavior worth repeating.",
  ],
  steady_growth: [
    "Acknowledge steady building — ensure growth aligns with their values.",
    "Ask which parts feel like genuine learning vs. box-checking.",
  ],
  plateau: [
    "Explore whether this is mastery, a ceiling, or quiet stagnation.",
    "Cross-reference energy: energizing plateau vs. draining plateau.",
  ],
  transition_dip: [
    "Normalize transition dips — learning phase, not failure.",
    "Protect confidence during role or rotation change.",
  ],
  decline_draining: [
    "Engagement may be declining with draining work — explore alignment, not guilt.",
    "Use wellness tone; one micro-step, not overhaul.",
  ],
};

export function inferTrajectoryState(input: TrajectoryInferenceInput): {
  state: TrajectoryState;
  coachingSignals: string[];
} {
  const snapshots = input.recentMetricSnapshots ?? [];

  if (input.recentRotationChange) {
    return {
      state: "transition_dip",
      coachingSignals: TRAJECTORY_COACHING.transition_dip,
    };
  }

  if (
    input.workloadRecognitionGap === "elevated" &&
    (input.burnoutElevated || input.serviceFootprintBand === "strong")
  ) {
    return {
      state: "decline_draining",
      coachingSignals: TRAJECTORY_COACHING.decline_draining,
    };
  }

  if (snapshots.length >= 3) {
    const ordered = [...snapshots].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    const first = ordered[0]!.percentile;
    const last = ordered[ordered.length - 1]!.percentile;
    const delta = last - first;

    if (delta >= 8) {
      return {
        state: "acceleration",
        coachingSignals: TRAJECTORY_COACHING.acceleration,
      };
    }
    if (delta <= -8) {
      return {
        state: "decline_draining",
        coachingSignals: TRAJECTORY_COACHING.decline_draining,
      };
    }
    if (Math.abs(delta) <= 3) {
      return {
        state: "plateau",
        coachingSignals: TRAJECTORY_COACHING.plateau,
      };
    }
  }

  return {
    state: "steady_growth",
    coachingSignals: TRAJECTORY_COACHING.steady_growth,
  };
}
