import { SKILLS, DOMAINS } from "@/lib/constants";
import type { ClassificationResult } from "@/lib/types/database";

const SKILL_KEYWORDS: Record<string, string[]> = {
  [SKILLS[0]]: ["clinical", "patient", "diagnosis", "treatment", "care"],
  [SKILLS[3]]: ["communication", "conversation", "family", "meeting"],
  [SKILLS[6]]: ["team", "collaborat", "committee", "partner"],
  [SKILLS[5]]: ["lead", "director", "chair", "manage", "admin"],
  [SKILLS[2]]: [
    "teach",
    "mentor",
    "curriculum",
    "resident",
    "fellow",
    "education",
    "scholar",
  ],
};

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  [DOMAINS[0]]: ["clinical", "patient", "rounds"],
  [DOMAINS[1]]: ["teach", "mentor", "resident", "fellow", "education"],
  [DOMAINS[3]]: ["lead", "director", "chair", "committee"],
  [DOMAINS[6]]: ["quality", "safety", "improvement"],
};

export function classifyActivityFallback(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  let skill:  string = SKILLS[2]!;
  let domain: string = DOMAINS[0]!;
  let bestSkillScore  = 0;
  let bestDomainScore = 0;

  for (const [s, words] of Object.entries(SKILL_KEYWORDS)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestSkillScore) {
      bestSkillScore = score;
      skill = s;
    }
  }

  for (const [d, words] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestDomainScore) {
      bestDomainScore = score;
      domain = d;
    }
  }

  if (lower.includes("mentor") || lower.includes("teach")) {
    domain = DOMAINS[1]!;
    skill  = SKILLS[2]!;
  }

  const confidence = 0.55 + Math.min(bestSkillScore + bestDomainScore, 3) * 0.1;

  return {
    primary_domain: skill,   // activity_entries.primary_domain = skill name
    primary_track:  domain,  // activity_entries.primary_track  = domain/identity name
    primary_domain_confidence: confidence,
    primary_track_confidence:  confidence,
    scope: "team",
    evidence_strength: "self_reported",
    confidence_score: confidence,
    rationale: "Keyword-based classification (add OPENAI_API_KEY for GPT-4).",
  };
}
