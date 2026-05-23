import type { PracticeSetting, PrimaryCareerTrack } from "@/lib/v2/onboarding-options";
import { normalizeCdiTrack, specialtyGroup, type SpecialtyGroup } from "@/lib/v2/career-language";

export type CdiDomainKey =
  | "clinical_volume"
  | "research_influence"
  | "quality_outcomes"
  | "teaching_impact"
  | "mentoring_precepting"
  | "service_citizenship"
  | "wellbeing"
  | "professional_growth"
  | "therapeutic_expertise"
  | "leadership_management"
  | "innovation_impact"
  | "network_influence"
  | "clinical_maintenance";

export type CdiWeightProfile = Record<CdiDomainKey, number>;

type TrackKey = "Researcher" | "Clinician-Educator" | "Clinician" | "Leader/Admin";

const ACADEMIC_COGNITIVE: Record<TrackKey, CdiWeightProfile> = {
  Researcher: w(0.1, 0.35, 0, 0.1, 0, 0.15, 0.15, 0.15),
  "Clinician-Educator": w(0.2, 0.1, 0, 0.3, 0, 0.15, 0.15, 0.1),
  Clinician: w(0.35, 0.05, 0, 0.15, 0, 0.15, 0.2, 0.1),
  "Leader/Admin": w(0.15, 0.1, 0, 0.1, 0, 0.2, 0.2, 0.25),
};

const ACADEMIC_PROCEDURAL: Record<TrackKey, CdiWeightProfile> = {
  Researcher: w(0.15, 0.35, 0, 0.1, 0, 0.1, 0.15, 0.15),
  "Clinician-Educator": w(0.3, 0.1, 0, 0.25, 0, 0.1, 0.15, 0.1),
  Clinician: w(0.4, 0.05, 0, 0.1, 0, 0.1, 0.2, 0.15),
  "Leader/Admin": w(0.2, 0.1, 0, 0.1, 0, 0.15, 0.2, 0.25),
};

const ACADEMIC_DIAGNOSTIC: Record<TrackKey, CdiWeightProfile> = {
  Researcher: w(0.15, 0.35, 0, 0.1, 0, 0.1, 0.15, 0.15),
  "Clinician-Educator": w(0.25, 0.1, 0, 0.3, 0, 0.1, 0.15, 0.1),
  Clinician: w(0.35, 0.05, 0, 0.15, 0, 0.15, 0.2, 0.1),
  "Leader/Admin": w(0.15, 0.1, 0, 0.1, 0, 0.2, 0.2, 0.25),
};

const ACADEMIC_PRIMARY: Record<TrackKey, CdiWeightProfile> = {
  Researcher: w(0.1, 0.3, 0, 0.15, 0, 0.15, 0.15, 0.15),
  "Clinician-Educator": w(0.2, 0.1, 0, 0.3, 0, 0.15, 0.15, 0.1),
  Clinician: w(0.3, 0.05, 0, 0.15, 0, 0.15, 0.2, 0.15),
  "Leader/Admin": w(0.15, 0.1, 0, 0.1, 0, 0.2, 0.2, 0.25),
};

const COMMUNITY_BY_GROUP: Record<SpecialtyGroup, CdiWeightProfile> = {
  cognitive: community(0.25, 0.15, 0.15, 0.15, 0.2, 0.1),
  procedural: community(0.35, 0.2, 0.1, 0.1, 0.2, 0.1),
  primary_care: community(0.25, 0.15, 0.1, 0.15, 0.2, 0.15),
  diagnostic: community(0.3, 0.2, 0.1, 0.1, 0.2, 0.1),
  other: community(0.25, 0.15, 0.15, 0.15, 0.2, 0.1),
};

const INDUSTRY_MEDICAL_AFFAIRS: CdiWeightProfile = industry(0.3, 0.15, 0.2, 0.15, 0.15, 0.05);

function w(
  clinical: number,
  research: number,
  quality: number,
  teaching: number,
  mentoring: number,
  service: number,
  wellbeing: number,
  growth: number,
): CdiWeightProfile {
  return {
    clinical_volume: clinical,
    research_influence: research,
    quality_outcomes: quality,
    teaching_impact: teaching,
    mentoring_precepting: mentoring,
    service_citizenship: service,
    wellbeing,
    professional_growth: growth,
    therapeutic_expertise: 0,
    leadership_management: 0,
    innovation_impact: 0,
    network_influence: 0,
    clinical_maintenance: 0,
  };
}

function community(
  clinical: number,
  quality: number,
  mentoring: number,
  service: number,
  wellbeing: number,
  growth: number,
): CdiWeightProfile {
  return {
    clinical_volume: clinical,
    research_influence: 0,
    quality_outcomes: quality,
    teaching_impact: 0,
    mentoring_precepting: mentoring,
    service_citizenship: service,
    wellbeing,
    professional_growth: growth,
    therapeutic_expertise: 0,
    leadership_management: 0,
    innovation_impact: 0,
    network_influence: 0,
    clinical_maintenance: 0,
  };
}

function industry(
  expertise: number,
  leadership: number,
  innovation: number,
  wellbeing: number,
  network: number,
  clinical: number,
): CdiWeightProfile {
  return {
    clinical_volume: 0,
    research_influence: 0,
    quality_outcomes: 0,
    teaching_impact: 0,
    mentoring_precepting: 0,
    service_citizenship: 0,
    wellbeing,
    professional_growth: 0,
    therapeutic_expertise: expertise,
    leadership_management: leadership,
    innovation_impact: innovation,
    network_influence: network,
    clinical_maintenance: clinical,
  };
}

export function resolveCdiWeights(
  specialty: string | null,
  setting: PracticeSetting | null,
  track: PrimaryCareerTrack | null,
): CdiWeightProfile {
  const normalizedTrack = normalizeCdiTrack(track);
  const group = specialtyGroup(specialty);

  if (setting === "Industry") {
    return INDUSTRY_MEDICAL_AFFAIRS;
  }

  if (setting === "Community" || setting === "Hybrid") {
    return COMMUNITY_BY_GROUP[group] ?? COMMUNITY_BY_GROUP.other;
  }

  const table =
    group === "procedural"
      ? ACADEMIC_PROCEDURAL
      : group === "diagnostic"
        ? ACADEMIC_DIAGNOSTIC
        : group === "primary_care"
          ? ACADEMIC_PRIMARY
          : ACADEMIC_COGNITIVE;

  return table[normalizedTrack];
}

/** User-facing domain labels for the 6-spoke wheel by setting. */
export function cdiDomainDisplayLabels(setting: PracticeSetting | null): Record<CdiDomainKey, string | null> {
  if (setting === "Industry") {
    return {
      clinical_volume: null,
      research_influence: null,
      quality_outcomes: null,
      teaching_impact: null,
      mentoring_precepting: null,
      service_citizenship: null,
      wellbeing: "Well-being",
      professional_growth: null,
      therapeutic_expertise: "Therapeutic Expertise",
      leadership_management: "Leadership & Management",
      innovation_impact: "Innovation & Impact",
      network_influence: "Network & Influence",
      clinical_maintenance: "Clinical Practice Maintenance",
    };
  }

  if (setting === "Community" || setting === "Hybrid") {
    return {
      clinical_volume: "Clinical Volume",
      research_influence: null,
      quality_outcomes: "Quality & Outcomes",
      teaching_impact: null,
      mentoring_precepting: "Mentoring & Precepting",
      service_citizenship: "Service Citizenship",
      wellbeing: "Well-being",
      professional_growth: "Professional Growth",
      therapeutic_expertise: null,
      leadership_management: null,
      innovation_impact: null,
      network_influence: null,
      clinical_maintenance: null,
    };
  }

  return {
    clinical_volume: "Clinical Volume",
    research_influence: "Research Influence",
    quality_outcomes: null,
    teaching_impact: "Teaching Impact",
    mentoring_precepting: null,
    service_citizenship: "Service & Citizenship",
    wellbeing: "Well-being",
    professional_growth: "Professional Growth",
    therapeutic_expertise: null,
    leadership_management: null,
    innovation_impact: null,
    network_influence: null,
    clinical_maintenance: null,
  };
}

export function computeWeightedCdiScore(
  domainScores: Partial<Record<CdiDomainKey, number>>,
  weights: CdiWeightProfile,
): { score: number; weightedDomains: Record<string, number> } {
  const weightedDomains: Record<string, number> = {};
  let score = 0;

  for (const [key, weight] of Object.entries(weights) as [CdiDomainKey, number][]) {
    if (weight <= 0) continue;
    const raw = domainScores[key] ?? 50;
    const contribution = raw * weight;
    weightedDomains[key] = Math.round(raw);
    score += contribution;
  }

  return { score: Math.round(score), weightedDomains };
}
