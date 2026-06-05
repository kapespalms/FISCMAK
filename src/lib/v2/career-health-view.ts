import type { AppUser, CareerAssessment } from "@/lib/v2/types";
import type { PracticeSetting } from "@/lib/v2/onboarding-options";
import type { CvMetrics } from "@/lib/v2/cv-metrics";
import {
  burnoutRiskFromSignal,
  careerHealthScoreSummary,
  careerLevelAspirationPrompt,
  careerLevelDashboardTitle,
  clinicalVolumePhrase,
  fulfillmentSummary,
  promotionReadinessLabel,
  researchInfluencePhrase,
  researchInfluenceSummary,
  scoreToStatus,
  serviceCitizenshipSummary,
  taskBurdenSummary,
  unrecognizedWorkSummary,
  type MetricStatus,
} from "@/lib/v2/career-language";
import {
  cdiDomainDisplayLabels,
  computeWeightedCdiScore,
  resolveCdiWeights,
  type CdiDomainKey,
} from "@/lib/v2/cdi-weights";
import { getOnboardingMetadata, type OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { InstrumentScore } from "@/lib/v2/onboarding-instruments";

export type CareerHealthDomain = {
  key: CdiDomainKey;
  label: string;
  score: number;
  status: MetricStatus;
  summary: string;
  weight: number;
  technical: Record<string, unknown>;
};

export type CareerHealthMetric = {
  id: string;
  label: string;
  summary: string;
  status?: MetricStatus;
  show_score: boolean;
  technical: Record<string, unknown>;
};

export type CareerHealthView = {
  dashboard_title: string;
  aspiration_prompt: string;
  intro: string;
  career_health_score: number;
  career_health_summary: string;
  promotion_label: string;
  domains: CareerHealthDomain[];
  wellbeing_metrics: CareerHealthMetric[];
  weights_adjustable_note: string;
};

function instrumentScore(meta: OnboardingMetadata, id: string): InstrumentScore | undefined {
  const scores = meta.instrument_scores as Record<string, InstrumentScore> | undefined;
  return scores?.[id];
}

function domainScoresFromData(input: {
  user: AppUser;
  cvMetrics: CvMetrics | null;
  meta: OnboardingMetadata;
}): Partial<Record<CdiDomainKey, number>> {
  const { user, cvMetrics, meta } = input;
  const sib = instrumentScore(meta, "single_item_burnout");
  const who5 = instrumentScore(meta, "who5");
  const invisible = instrumentScore(meta, "invisible_work");
  const career = instrumentScore(meta, "career_aspirations");

  const domains = cvMetrics?.domain_scores;
  const evidence = cvMetrics?.evidence;

  // Well-being: WHO-5 percentage score (0–100) preferred; SIB inverted as fallback
  const wellbeingScore = who5?.raw.percentage_score != null
    ? Math.round(who5.raw.percentage_score as number)
    : sib?.raw.level != null
      ? Math.max(0, Math.round(100 - ((sib.raw.level as number) - 1) * 25))
      : 50;

  return {
    clinical_volume: domains ? Math.min(100, domains.clinical * 10) : 50,
    research_influence: domains ? Math.min(100, domains.scholarship * 10) : 50,
    quality_outcomes: evidence ? Math.min(100, evidence.qi_signals * 15 + 40) : 50,
    teaching_impact: domains ? Math.min(100, domains.teaching * 10) : 50,
    mentoring_precepting: evidence
      ? Math.min(100, evidence.mentoring_mentions * 12 + 35)
      : 50,
    service_citizenship: cvMetrics?.s_index ?? 50,
    wellbeing: wellbeingScore,
    professional_growth: career?.raw.track_energy
      ? Math.min(100, Number(career.raw.track_energy) * 10)
      : Math.min(100, (cvMetrics?.promotion_aligned_pct ?? 50)),
    therapeutic_expertise: domains ? Math.min(100, domains.scholarship * 10) : 50,
    leadership_management: evidence
      ? Math.min(100, evidence.leadership_roles * 15 + 30)
      : 50,
    innovation_impact: evidence ? Math.min(100, evidence.qi_signals * 12 + 35) : 50,
    network_influence: cvMetrics?.s_index ?? 50,
    clinical_maintenance: domains ? Math.min(100, domains.clinical * 10) : 50,
    ...(invisible?.raw.weekly_hours
      ? {
          professional_growth: Math.max(
            30,
            (career?.raw.track_energy ? Number(career.raw.track_energy) * 10 : 50) -
              Math.min(20, Number(invisible.raw.weekly_hours) / 2),
          ),
        }
      : {}),
  };
}

function domainSummary(
  key: CdiDomainKey,
  score: number,
  user: AppUser,
  cvMetrics: CvMetrics | null,
  meta: OnboardingMetadata,
): string {
  const setting = user.practice_setting;
  const specialty = user.specialty;
  const rank = user.academic_rank;
  const evidence = cvMetrics?.evidence;
  const sib = instrumentScore(meta, "single_item_burnout");
  const invisible = instrumentScore(meta, "invisible_work");

  switch (key) {
    case "clinical_volume":
      return score >= 70
        ? `Your ${clinicalVolumePhrase(specialty)} is above average for ${specialty ?? "your specialty"}${rank ? ` at the ${rank.toLowerCase()} level` : ""}.`
        : `Your ${clinicalVolumePhrase(specialty)} is developing — typical for your current career stage.`;
    case "research_influence":
      return researchInfluenceSummary({
        percentile: score,
        specialty,
        rank,
        trend: score >= 60 ? "up" : "stable",
      });
    case "quality_outcomes":
      return score >= 70
        ? "Your quality and outcomes signals are strong for community practice."
        : "Quality metrics are an area to strengthen as data becomes available.";
    case "teaching_impact":
      return score >= 70
        ? "Strong teaching evaluations and curriculum contributions place you well above average."
        : "Teaching impact is emerging — document evaluations and innovations to strengthen this area.";
    case "mentoring_precepting":
      return score >= 70
        ? "Your mentoring and precepting contributions are well documented."
        : "Mentoring and precepting are growth areas — even informal mentoring counts.";
    case "service_citizenship":
      return serviceCitizenshipSummary({
        score,
        committeeRoles: evidence?.committee_roles,
        mentoringMentions: evidence?.mentoring_mentions,
      });
    case "wellbeing": {
      const burnout = burnoutRiskFromSignal(sib?.raw.level as number | undefined);
      return burnout.summary;
    }
    case "professional_growth":
      return score >= 70
        ? "You've expanded scope and skills this year — certifications, new services, or career alignment gains."
        : "Professional growth is an opportunity — consider skills, certifications, or scope expansion.";
    case "therapeutic_expertise":
      return `Depth in your therapeutic area is ${score >= 70 ? "strong" : "developing"} — industry roles value focused expertise.`;
    case "leadership_management":
      return score >= 70
        ? "Leadership and management contributions are well represented."
        : "Leadership experience is an area to build for industry advancement.";
    case "innovation_impact":
      return score >= 70
        ? "Innovation signals — QI, digital health, or process improvements — are visible."
        : "Innovation impact is an emerging area worth documenting.";
    case "network_influence":
      return score >= 70
        ? "Your professional network and influence appear strong."
        : "Network and influence can grow through advisory roles and speaking.";
    case "clinical_maintenance":
      return score >= 50
        ? "You maintain clinical practice alongside industry work — an important identity anchor."
        : "Clinical practice maintenance may be limited — worth tracking if clinical identity matters to you.";
    default:
      return taskBurdenSummary({
        unnecessary: undefined,
        unreasonable: undefined,
        weeklyHours: invisible?.raw.weekly_hours as number | undefined,
      });
  }
}

export function buildCareerHealthView(input: {
  user: AppUser;
  cvMetrics?: CvMetrics | null;
  assessments?: CareerAssessment[];
}): CareerHealthView {
  const { user, cvMetrics = null } = input;
  const meta = getOnboardingMetadata(user);
  const setting = (user.practice_setting as PracticeSetting | null) ?? "Academic";
  const weights = resolveCdiWeights(user.specialty, setting, user.primary_career_track);
  const labels = cdiDomainDisplayLabels(setting);
  const rawScores = domainScoresFromData({ user, cvMetrics, meta });
  const { score, weightedDomains } = computeWeightedCdiScore(rawScores, weights);

  const domains: CareerHealthDomain[] = [];
  for (const [key, weight] of Object.entries(weights) as [CdiDomainKey, number][]) {
    if (weight <= 0) continue;
    const label = labels[key];
    if (!label) continue;
    const domainScore = weightedDomains[key] ?? 50;
    domains.push({
      key,
      label,
      score: domainScore,
      status: scoreToStatus(domainScore),
      summary: domainSummary(key, domainScore, user, cvMetrics, meta),
      weight,
      technical: buildDomainTechnical(key, domainScore, user, cvMetrics, meta),
    });
  }

  domains.sort((a, b) => b.score - a.score);
  const strongest = domains.filter((d) => d.status === "strong").slice(0, 2).map((d) => d.label);
  const growth = domains.filter((d) => d.status !== "strong").slice(-2).map((d) => d.label);

  const sib2 = instrumentScore(meta, "single_item_burnout");
  const who5_2 = instrumentScore(meta, "who5");
  const invisible2 = instrumentScore(meta, "invisible_work");
  const burnout = burnoutRiskFromSignal(sib2?.raw.level as number | undefined);

  const wellbeing_metrics: CareerHealthMetric[] = [
    {
      id: "burnout_risk",
      label: "Professional Sustainability",
      summary: burnout.summary,
      status: burnout.status,
      show_score: false,
      technical: {
        backend_metric: "burnout_signal",
        sib_level: sib2?.raw.level ?? null,
        threshold_positive: 3,
      },
    },
    {
      id: "wellbeing_score",
      label: "Well-Being",
      summary: fulfillmentSummary(
        who5_2?.raw.percentage_score != null
          ? Math.round((who5_2.raw.percentage_score as number) / 20)  // 0–100 → 0–5 for label compatibility
          : undefined,
      ),
      show_score: false,
      technical: {
        backend_metric: "wellbeing_score",
        who5_pct: who5_2?.raw.percentage_score ?? null,
      },
    },
    {
      id: "task_burden",
      label: "Task Burden",
      summary: taskBurdenSummary({
        unnecessary: undefined,
        unreasonable: undefined,
        weeklyHours: invisible2?.raw.weekly_hours as number | undefined,
      }),
      show_score: false,
      technical: {
        backend_metric: "iwq",
      },
    },
    {
      id: "unrecognized_work",
      label: "Unrecognized Work",
      summary: unrecognizedWorkSummary({
        weeklyHours: invisible2?.raw.weekly_hours as number | undefined,
        specialty: user.specialty,
        aboveAverage: (invisible2?.raw.weekly_hours as number | undefined) != null &&
          Number(invisible2?.raw.weekly_hours) > 10,
      }),
      show_score: false,
      technical: {
        backend_metric: "iwq",
        invisible_weekly_hours: invisible2?.raw.weekly_hours ?? null,
        s_index: cvMetrics?.s_index ?? null,
        iwq: cvMetrics?.iwq ?? meta.iwq ?? null,
      },
    },
  ];

  const name = user.name?.startsWith("Dr.") ? user.name : user.name ? `Dr. ${user.name.split(" ").slice(-1)[0]}` : "there";

  return {
    dashboard_title: careerLevelDashboardTitle(user.career_stage),
    aspiration_prompt: careerLevelAspirationPrompt(user.career_stage),
    intro: `Welcome, ${name}. Based on your profile${cvMetrics ? ", CV, and self-assessment" : " and self-assessment"}, here's your initial Career Health snapshot.`,
    career_health_score: score,
    career_health_summary: careerHealthScoreSummary(score, strongest, growth),
    promotion_label: promotionReadinessLabel(setting, user.specialty),
    domains,
    wellbeing_metrics,
    weights_adjustable_note:
      "These weights reflect how your specialty and setting typically value different contributions. You can adjust them to match your institution's expectations or your personal priorities.",
  };
}

function buildDomainTechnical(
  key: CdiDomainKey,
  score: number,
  user: AppUser,
  cvMetrics: CvMetrics | null,
  meta: OnboardingMetadata,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    domain_score: score,
    specialty: user.specialty,
    practice_setting: user.practice_setting,
    career_track: user.primary_career_track,
  };

  if (key === "research_influence" && cvMetrics) {
    return {
      ...base,
      backend_metrics: ["h_index", "m_quotient", "g_index", "rcr", "wrcr"],
      estimated_percentile: score,
      publication_signals: cvMetrics.evidence.publication_signals,
      scholarship_domain_score: cvMetrics.domain_scores.scholarship,
      data_sources: "CV parse (PubMed/OpenAlex enrichment pending)",
      benchmark_note: "Percentile estimated from CV evidence until API enrichment completes",
    };
  }

  if (key === "service_citizenship" && cvMetrics) {
    return {
      ...base,
      backend_metric: "s_index",
      s_index: cvMetrics.s_index,
      committee_roles: cvMetrics.evidence.committee_roles,
      mentoring_mentions: cvMetrics.evidence.mentoring_mentions,
      leadership_roles: cvMetrics.evidence.leadership_roles,
    };
  }

  if (key === "wellbeing") {
    const sib3 = instrumentScore(meta, "single_item_burnout");
    const who5_3 = instrumentScore(meta, "who5");
    return {
      ...base,
      backend_metrics: ["burnout_signal", "wellbeing_score"],
      sib_level: sib3?.raw.level ?? null,
      who5_pct: who5_3?.raw.percentage_score ?? null,
    };
  }

  return base;
}

export function buildCareerHealthIntroForMak(view: CareerHealthView): string {
  const domainLines = view.domains
    .slice(0, 6)
    .map((d) => `${d.label}: ${d.score}/100 — ${d.summary.split(".")[0]}.`)
    .join("\n");
  return `${view.intro}\n\nCareer Health Score: ${view.career_health_score}/100\n\n${domainLines}`;
}
