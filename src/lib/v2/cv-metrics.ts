import type { CareerAssessment } from "@/lib/v2/types";

export type CvEvidence = {
  mentoring_mentions: number;
  committee_roles: number;
  leadership_roles: number;
  service_mentions: number;
  teaching_signals: number;
  publication_signals: number;
  clinical_signals: number;
  qi_signals: number;
  dei_advocacy_signals: number;
  promotion_domains: {
    teaching: number;
    scholarship: number;
    clinical: number;
    service: number;
  };
  invisible_work_signals: string[];
};

export type CvMetrics = {
  s_index: number;
  promotion_aligned_pct: number;
  bits_score: number;
  iwq: number;
  domain_scores: {
    teaching: number;
    scholarship: number;
    clinical: number;
    service: number;
  };
  evidence: CvEvidence;
  interpretation: {
    s_index: string;
    iwq: string;
  };
};

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((sum, pattern) => {
    const hits = text.match(new RegExp(pattern.source, `${pattern.flags}g`));
    return sum + (hits?.length ?? 0);
  }, 0);
}

export function analyzeCvEvidence(text: string): CvEvidence {
  const lower = text.toLowerCase();

  const mentoring_mentions = countMatches(lower, [
    /\bmentor(?:ed|ing|ship)?\b/,
    /\bmentee\b/,
    /\bpreceptor\b/,
    /\badvisor\b/,
  ]);

  const committee_roles = countMatches(lower, [
    /\bcommittee\b/,
    /\btask force\b/,
    /\bworkgroup\b/,
    /\bcouncil\b/,
  ]);

  const leadership_roles = countMatches(lower, [
    /\bchair(?:man|woman|person)?\b/,
    /\bdirector\b/,
    /\bchief\b/,
    /\bvice[- ]?chair\b/,
    /\bprogram director\b/,
    /\bdivision head\b/,
  ]);

  const service_mentions = countMatches(lower, [
    /\bservice\b/,
    /\badministrative\b/,
    /\binstitutional\b/,
    /\bdepartment(?:al)?\b/,
  ]);

  const teaching_signals = countMatches(lower, [
    /\bteach(?:ing|er|es)?\b/,
    /\beducator\b/,
    /\bcurriculum\b/,
    /\blecture\b/,
    /\bworkshop\b/,
    /\bmedical student\b/,
    /\bresident\b/,
  ]);

  const publication_signals = countMatches(lower, [
    /\bpublication\b/,
    /\bpeer[- ]reviewed\b/,
    /\bdoi:\b/,
    /\bet al\.?\b/,
    /\bjournal\b/,
    /\babstract\b/,
    /\bgrant\b/,
  ]);

  const clinical_signals = countMatches(lower, [
    /\bclinical\b/,
    /\bpatient care\b/,
    /\battending\b/,
    /\bhospitalist\b/,
    /\bclinic\b/,
    /\bboard certified\b/,
  ]);

  const qi_signals = countMatches(lower, [
    /\bquality improvement\b/,
    /\bqi\b/,
    /\bpatient safety\b/,
    /\bprocess improvement\b/,
  ]);

  const dei_advocacy_signals = countMatches(lower, [
    /\bdei\b/,
    /\bdiversity\b/,
    /\badvocacy\b/,
    /\bcommunity outreach\b/,
    /\bhealth equity\b/,
  ]);

  const promotion_domains = {
    teaching: Math.min(100, teaching_signals * 12 + (lower.includes("teaching award") ? 20 : 0)),
    scholarship: Math.min(100, publication_signals * 10 + (lower.includes("principal investigator") ? 15 : 0)),
    clinical: Math.min(100, clinical_signals * 10),
    service: Math.min(
      100,
      committee_roles * 10 + leadership_roles * 12 + service_mentions * 4 + mentoring_mentions * 8,
    ),
  };

  const invisible_work_signals: string[] = [];
  if (mentoring_mentions >= 2) invisible_work_signals.push("mentoring");
  if (committee_roles >= 2) invisible_work_signals.push("committee service");
  if (leadership_roles >= 1) invisible_work_signals.push("leadership");
  if (dei_advocacy_signals >= 1) invisible_work_signals.push("DEI/advocacy");
  if (qi_signals >= 1) invisible_work_signals.push("quality improvement");
  if (/\buncompensated\b|\bvolunteer\b|\bwithout compensation\b/.test(lower)) {
    invisible_work_signals.push("uncompensated service");
  }

  return {
    mentoring_mentions,
    committee_roles,
    leadership_roles,
    service_mentions,
    teaching_signals,
    publication_signals,
    clinical_signals,
    qi_signals,
    dei_advocacy_signals,
    promotion_domains,
    invisible_work_signals,
  };
}

/** S-Index: invisible service currency documented on the CV (0–100). */
export function computeSIndex(evidence: CvEvidence): number {
  return explainSIndex(evidence).capped;
}

export type SIndexBreakdown = {
  raw: number;
  capped: number;
  components: Array<{
    key: string;
    label: string;
    count: number;
    weight: number;
    points: number;
  }>;
};

/** KP Admin — transparent formula breakdown for internal tracking only. */
export function explainSIndex(evidence: CvEvidence): SIndexBreakdown {
  const components: SIndexBreakdown["components"] = [
    {
      key: "mentoring_mentions",
      label: "Mentoring mentions",
      count: evidence.mentoring_mentions,
      weight: 8,
      points: evidence.mentoring_mentions * 8,
    },
    {
      key: "committee_roles",
      label: "Committee roles",
      count: evidence.committee_roles,
      weight: 7,
      points: evidence.committee_roles * 7,
    },
    {
      key: "leadership_roles",
      label: "Leadership roles",
      count: evidence.leadership_roles,
      weight: 9,
      points: evidence.leadership_roles * 9,
    },
    {
      key: "service_mentions",
      label: "Service mentions",
      count: evidence.service_mentions,
      weight: 3,
      points: evidence.service_mentions * 3,
    },
    {
      key: "qi_signals",
      label: "QI signals",
      count: evidence.qi_signals,
      weight: 6,
      points: evidence.qi_signals * 6,
    },
    {
      key: "dei_advocacy_signals",
      label: "DEI / advocacy signals",
      count: evidence.dei_advocacy_signals,
      weight: 5,
      points: evidence.dei_advocacy_signals * 5,
    },
    {
      key: "invisible_work_signals",
      label: "Invisible work signal lines",
      count: evidence.invisible_work_signals.length,
      weight: 4,
      points: evidence.invisible_work_signals.length * 4,
    },
  ];
  const raw = components.reduce((sum, c) => sum + c.points, 0);
  return { raw, capped: Math.min(100, Math.round(raw)), components };
}

export function computePromotionAlignedPct(evidence: CvEvidence): number {
  const domains = Object.values(evidence.promotion_domains);
  const covered = domains.filter((score) => score >= 20).length;
  const strength = domains.reduce((sum, score) => sum + Math.min(score, 100), 0) / 4;
  return Math.round(covered * 15 + strength * 0.4);
}

/** Task-burden proxy from TP3 invisible-work / burnout answers (0–100). Higher = more burden. */
export function computeBitsScore(assessments: CareerAssessment[]): number | null {
  const tp3 = assessments.find((a) => a.touchpoint_number === 3 && a.completed_at);
  if (!tp3) return null;

  const answers = tp3.questions_answered;
  const likert = (qId: string, reverse = false) => {
    const answer = answers.find((a) => a.q_id === qId)?.answer;
    const n = typeof answer === "number" ? answer : parseInt(String(answer ?? ""), 10);
    if (Number.isNaN(n) || n < 1 || n > 5) return null;
    return reverse ? 6 - n : n;
  };

  const exhaustion = likert("Q3.1") ?? 3;
  const cynicism = likert("Q3.2") ?? 3;
  const effectiveness = likert("Q3.3", true) ?? 3;
  const sustainability = likert("Q3.4", true) ?? 3;
  const visibility = likert("Q3.8", true) ?? 3;

  const hoursAnswer = answers.find((a) => a.q_id === "Q3.6")?.answer;
  const hours = parseInt(String(hoursAnswer ?? "").replace(/\D/g, ""), 10);
  const hoursBurden = Number.isNaN(hours) ? 50 : Math.min(100, Math.round((hours / 40) * 100));

  const burnoutAvg = ((exhaustion + cynicism + effectiveness + sustainability) / 4) * 20;
  const invisibility = visibility * 20;

  return Math.min(100, Math.round(burnoutAvgWeighted(burnoutAvg, invisibility, hoursBurden)));
}

function burnoutAvgWeighted(burnout: number, invisibility: number, hours: number): number {
  return burnout * 0.45 + invisibility * 0.35 + hours * 0.2;
}

/** Estimate task-burden proxy from CV when TP3 is incomplete — high service with low scholarship visibility. */
export function estimateBitsFromCv(evidence: CvEvidence): number {
  const serviceLoad = evidence.promotion_domains.service;
  const scholarshipGap = Math.max(0, 60 - evidence.promotion_domains.scholarship);
  return Math.min(100, Math.round(serviceLoad * 0.5 + scholarshipGap * 0.5));
}

/**
 * IWQ = invisible work burden when service is high, task burden is high,
 * and work is not promotion-aligned.
 */
export function computeIwq(input: {
  sIndex: number;
  bitsScore: number;
  promotionAlignedPct: number;
}): number {
  const unrecognized = (100 - input.promotionAlignedPct) / 100;
  return Math.min(
    100,
    Math.round((input.sIndex / 100) * (input.bitsScore / 100) * unrecognized * 100),
  );
}

export function interpretSIndex(score: number): string {
  if (score >= 75) return "Strong documented service and invisible work on your CV.";
  if (score >= 50) return "Moderate service footprint — some invisible work is documented.";
  if (score >= 25) return "Limited service documentation — mentoring and committees may be undercounted.";
  return "Minimal service signals detected — upload a fuller CV or capture invisible work with Mak.";
}

export function interpretIwq(score: number): string {
  if (score >= 60) return "High invisible-work burden — service may be under-recognized for promotion.";
  if (score >= 35) return "Moderate invisible-work load — consider making service legible in narratives.";
  return "Lower invisible-work risk — documented work aligns reasonably with promotion domains.";
}

export function computeCvMetrics(
  text: string,
  assessments: CareerAssessment[] = [],
): CvMetrics {
  const evidence = analyzeCvEvidence(text);
  const s_index = computeSIndex(evidence);
  const promotion_aligned_pct = computePromotionAlignedPct(evidence);
  const bitsFromAssessment = computeBitsScore(assessments);
  const bits_score = bitsFromAssessment ?? estimateBitsFromCv(evidence);
  const iwq = computeIwq({ sIndex: s_index, bitsScore: bits_score, promotionAlignedPct: promotion_aligned_pct });

  return {
    s_index,
    promotion_aligned_pct,
    bits_score,
    iwq,
    domain_scores: evidence.promotion_domains,
    evidence,
    interpretation: {
      s_index: interpretSIndex(s_index),
      iwq: interpretIwq(iwq),
    },
  };
}
