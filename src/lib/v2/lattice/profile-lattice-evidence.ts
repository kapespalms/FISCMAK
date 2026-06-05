import type { AppUser, CareerAssessment } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  clustersForInstruments,
  instrumentProgress,
  scoreAllInstruments,
  type InstrumentAnswer,
} from "@/lib/v2/onboarding-instruments";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import type { PrimaryCareerTrack } from "@/lib/v2/onboarding-options";
import {
  acgmeLevelIndex,
  inferDevelopmentLevel,
  keywordPlacement,
  normalizeFiscmakTrack,
} from "@/lib/v2/lattice/ontology-bridge";
import {
  matchTextToActivityPlacement,
  resolveAcgmeFromDomainIndex,
} from "@/lib/v2/lattice/ontology-registry";
import type { LatticeEvidence } from "@/lib/v2/lattice/types";
import { isCheckinSummaryConfirmed } from "@/lib/v2/checkin-summary-confirm";

const CAREER_TRACK_TO_INDEX: Record<PrimaryCareerTrack, number> = {
  Clinician: 0,
  Educator: 1,
  Researcher: 2,
  Leader: 3,
  Advocate: 4,
  Innovator: 5,
  "Quality-Safety": 6,
  "Wellness Champion": 7,
};

function primaryTrackIndex(user: AppUser, meta: OnboardingMetadata): number {
  if (user.primary_career_track && user.primary_career_track in CAREER_TRACK_TO_INDEX) {
    return CAREER_TRACK_TO_INDEX[user.primary_career_track];
  }
  const top = meta.career_track_rankings?.find((r) => r.rank === 1);
  if (top && top.track in CAREER_TRACK_TO_INDEX) {
    return CAREER_TRACK_TO_INDEX[top.track];
  }
  return 0;
}

function resolveTextPlacement(text: string, fallbackTrackIndex: number) {
  const match = matchTextToActivityPlacement(text);
  if (match) {
    return {
      domainIndex: match.domainIndex,
      trackIndex: match.trackIndex,
      developmentLevel: inferDevelopmentLevel(text, match.defaultDevelopmentLevel),
      acgmeKey: match.acgmeKey,
    };
  }
  const keyword = keywordPlacement(text);
  if (keyword) {
    return {
      domainIndex: keyword.domainIndex,
      trackIndex: keyword.trackIndex,
      developmentLevel: inferDevelopmentLevel(text, keyword.developmentLevel),
      acgmeKey: keyword.acgmeKey,
    };
  }
  return {
    domainIndex: 7,
    trackIndex: fallbackTrackIndex,
    developmentLevel: inferDevelopmentLevel(text, 2),
    acgmeKey: resolveAcgmeFromDomainIndex(7),
  };
}

function pushEvidence(
  out: LatticeEvidence[],
  item: Omit<LatticeEvidence, "fiscmak" | "acgme"> & {
    domainIndex: number;
    trackIndex: number;
  },
): void {
  out.push({
    id: item.id,
    source: item.source,
    sourceLabel: item.sourceLabel,
    rawText: item.rawText,
    date: item.date,
    energy: item.energy,
    developmentLevel: item.developmentLevel,
    fiscmak: { domainIndex: item.domainIndex, trackIndex: item.trackIndex },
    acgme: {
      competencyKey: resolveAcgmeFromDomainIndex(item.domainIndex),
      levelIndex: acgmeLevelIndex(item.developmentLevel),
    },
  });
}

function profileEvidence(user: AppUser, meta: OnboardingMetadata): LatticeEvidence[] {
  const out: LatticeEvidence[] = [];
  const fallbackTrack = primaryTrackIndex(user, meta);

  const specialty = [user.base_specialty, user.subspecialty].filter(Boolean).join(" · ");
  if (specialty) {
    pushEvidence(out, {
      id: "profile-specialty",
      source: "profile",
      sourceLabel: "Profile · specialty",
      rawText: `Specialty focus: ${specialty}`,
      date: null,
      energy: null,
      developmentLevel: 2,
      domainIndex: 0,
      trackIndex: 0,
    });
  }

  if (user.current_rotation?.trim()) {
    pushEvidence(out, {
      id: "profile-rotation",
      source: "profile",
      sourceLabel: "Profile · current rotation",
      rawText: `Current rotation: ${user.current_rotation.trim()}`,
      date: null,
      energy: null,
      developmentLevel: 3,
      domainIndex: 0,
      trackIndex: 0,
    });
  }

  if (user.primary_career_track) {
    pushEvidence(out, {
      id: "profile-primary-track",
      source: "profile",
      sourceLabel: "Profile · primary career track",
      rawText: `Primary career track: ${user.primary_career_track}`,
      date: null,
      energy: null,
      developmentLevel: 2,
      domainIndex: 7,
      trackIndex: fallbackTrack,
    });
  }

  for (const ranking of meta.career_track_rankings ?? []) {
    if (ranking.rank > 3) continue;
    const trackIndex =
      ranking.track in CAREER_TRACK_TO_INDEX
        ? CAREER_TRACK_TO_INDEX[ranking.track]
        : normalizeFiscmakTrack(ranking.track);
    if (trackIndex < 0) continue;
    const hours =
      ranking.hours_per_week != null ? ` · ${ranking.hours_per_week} h/wk` : "";
    pushEvidence(out, {
      id: `profile-track-rank-${ranking.rank}`,
      source: "profile",
      sourceLabel: "Profile · track ranking",
      rawText: `#${ranking.rank} career track: ${ranking.track}${hours}`,
      date: null,
      energy: null,
      developmentLevel: ranking.rank === 1 ? 3 : 2,
      domainIndex: 7,
      trackIndex,
    });
  }

  if (user.specialty_origin?.trim()) {
    const placement = resolveTextPlacement(user.specialty_origin, fallbackTrack);
    pushEvidence(out, {
      id: "profile-specialty-origin",
      source: "profile",
      sourceLabel: "Profile · specialty origin",
      rawText: user.specialty_origin.trim(),
      date: null,
      energy: null,
      developmentLevel: placement.developmentLevel,
      domainIndex: placement.domainIndex,
      trackIndex: placement.trackIndex,
    });
  }

  return out;
}

function instrumentEvidence(
  user: AppUser,
  meta: OnboardingMetadata,
  answers: InstrumentAnswer[],
): LatticeEvidence[] {
  const out: LatticeEvidence[] = [];
  const instrumentIds =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting ?? null).map((i) => i.id);
  if (!instrumentIds.length || !answers.length) return out;

  const date =
    answers[answers.length - 1]?.capturedAt?.slice(0, 10) ??
    meta.computed_at?.slice(0, 10) ??
    null;
  const fallbackTrack = primaryTrackIndex(user, meta);
  const scores = scoreAllInstruments(instrumentIds, answers);
  const clusters = clustersForInstruments(instrumentIds);

  for (const answer of answers) {
    const cluster = clusters.find((c) => c.id === answer.clusterId);
    if (!cluster) continue;
    const text =
      typeof answer.value === "string"
        ? `${cluster.label}: ${answer.value}`
        : `${cluster.label}: ${answer.value}`;
    const placement = resolveTextPlacement(text, fallbackTrack);
    pushEvidence(out, {
      id: `assessment-${answer.clusterId}`,
      source: "assessment",
      sourceLabel: `Self-assessment · ${cluster.instrumentId}`,
      rawText: text,
      date: answer.capturedAt.slice(0, 10),
      energy: inferInstrumentEnergy(cluster.instrumentId, cluster.id, answer.value),
      developmentLevel: placement.developmentLevel,
      domainIndex: placement.domainIndex,
      trackIndex: placement.trackIndex,
    });
  }

  for (const score of scores) {
    if (score.instrumentId === "single_item_burnout" && (score.raw.level ?? 0) >= 3) {
      pushEvidence(out, {
        id: "assessment-burnout-signal",
        source: "assessment",
        sourceLabel: "Self-assessment · Burnout signal",
        rawText: score.interpretation ?? "Positive burnout signal.",
        date,
        energy: "draining",
        developmentLevel: 2,
        domainIndex: 7,
        trackIndex: 7,
      });
    }

    if (score.instrumentId === "who5" && (score.raw.percentage_score ?? 0) >= 52) {
      pushEvidence(out, {
        id: "assessment-wellbeing-adequate",
        source: "assessment",
        sourceLabel: "Self-assessment · Well-being",
        rawText: score.interpretation ?? "Adequate well-being signal.",
        date,
        energy: "energizing",
        developmentLevel: 2,
        domainIndex: 7,
        trackIndex: fallbackTrack,
      });
    }

    if (score.instrumentId === "invisible_work" && (score.raw.weekly_hours ?? 0) >= 5) {
      pushEvidence(out, {
        id: "assessment-invisible-work",
        source: "assessment",
        sourceLabel: "Self-assessment · invisible work",
        rawText: `${score.raw.weekly_hours} invisible work hours per week logged.`,
        date,
        energy: "draining",
        developmentLevel: 2,
        domainIndex: 6,
        trackIndex: 3,
      });
    }

    if (score.instrumentId === "career_aspirations" && (score.raw.track_energy ?? 0) >= 7) {
      pushEvidence(out, {
        id: "assessment-career-energy",
        source: "assessment",
        sourceLabel: "Self-assessment · career track energy",
        rawText: `High energy (${score.raw.track_energy}/10) on primary career track.`,
        date,
        energy: "energizing",
        developmentLevel: 3,
        domainIndex: 7,
        trackIndex: fallbackTrack,
      });
    }
  }

  return out;
}

function inferInstrumentEnergy(
  instrumentId: string,
  clusterId: string,
  value: number | string,
): string | null {
  if (typeof value !== "number") return null;
  if (clusterId.includes("burnout") || clusterId.includes("unnecessary") || clusterId.includes("unreasonable")) {
    return value >= 3 ? "draining" : "neutral";
  }
  if (clusterId.includes("fulfillment") || clusterId.includes("engagement") || clusterId.includes("energy")) {
    return value >= 3 ? "energizing" : "neutral";
  }
  if (instrumentId === "invisible_work") return value >= 10 ? "draining" : "neutral";
  return null;
}

function goalEvidence(meta: OnboardingMetadata, fallbackTrack: number): LatticeEvidence[] {
  const out: LatticeEvidence[] = [];
  for (const goal of meta.stored_goals ?? []) {
    if (goal.status === "paused") continue;
    const text = [goal.goal_title, goal.goal_description, goal.why_this_fits]
      .filter(Boolean)
      .join(" — ");
    if (!text.trim()) continue;
    const placement = resolveTextPlacement(text, fallbackTrack);
    pushEvidence(out, {
      id: `goal-${goal.id}`,
      source: "goal",
      sourceLabel: "Career goal",
      rawText: text,
      date: null,
      energy: null,
      developmentLevel: placement.developmentLevel,
      domainIndex: placement.domainIndex,
      trackIndex: placement.trackIndex,
    });
  }
  return out;
}

function careerAssessmentEvidence(assessments: CareerAssessment[], fallbackTrack: number): LatticeEvidence[] {
  const out: LatticeEvidence[] = [];
  for (const assessment of assessments) {
    for (const qa of assessment.questions_answered ?? []) {
      const text = `${qa.question}: ${String(qa.answer)}`;
      const placement = resolveTextPlacement(text, fallbackTrack);
      pushEvidence(out, {
        id: `touchpoint-${assessment.touchpoint_number}-${qa.q_id}`,
        source: "assessment",
        sourceLabel: `Touchpoint ${assessment.touchpoint_number} · ${assessment.question_category}`,
        rawText: text,
        date: qa.timestamp?.slice(0, 10) ?? assessment.completed_at?.slice(0, 10) ?? null,
        energy: null,
        developmentLevel: placement.developmentLevel,
        domainIndex: placement.domainIndex,
        trackIndex: placement.trackIndex,
      });
    }
  }
  return out;
}

export function buildProfileLatticeEvidence(input: {
  user: AppUser;
  meta: OnboardingMetadata;
  assessments?: CareerAssessment[];
}): LatticeEvidence[] {
  const fallbackTrack = primaryTrackIndex(input.user, input.meta);
  const confirmed = isCheckinSummaryConfirmed(input.meta);
  const answers = input.meta.instrument_answers ?? [];
  return [
    ...profileEvidence(input.user, input.meta),
    ...(confirmed ? instrumentEvidence(input.user, input.meta, answers) : []),
    ...goalEvidence(input.meta, fallbackTrack),
    ...(confirmed ? careerAssessmentEvidence(input.assessments ?? [], fallbackTrack) : []),
  ];
}

export function summarizeInstrumentEvaluation(user: AppUser, meta: OnboardingMetadata) {
  const instrumentIds =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting ?? null).map((i) => i.id);
  const answers = meta.instrument_answers ?? [];
  const progress = instrumentProgress(instrumentIds, answers);
  const scores = scoreAllInstruments(instrumentIds, answers).map((s) => ({
    instrument_id: s.instrumentId,
    name: s.name,
    interpretation: s.interpretation ?? null,
    composite: s.composite ?? null,
  }));
  return {
    instrument_ids: instrumentIds,
    answered: progress.answered,
    total: progress.total,
    complete: progress.answered >= progress.total && progress.total > 0,
    pending_cluster: progress.pendingCluster?.label ?? null,
    scores,
  };
}
