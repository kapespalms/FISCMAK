import { DOMAINS, TRACKS } from "@/lib/constants";
import type { ClassificationResult } from "@/lib/types/database";

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  [DOMAINS[0]]: ["clinical", "patient", "diagnosis", "treatment", "care"],
  [DOMAINS[3]]: ["communication", "conversation", "family", "meeting"],
  [DOMAINS[6]]: ["team", "collaborat", "committee", "partner"],
  [DOMAINS[5]]: ["lead", "director", "chair", "manage", "admin"],
  [DOMAINS[2]]: [
    "teach",
    "mentor",
    "curriculum",
    "resident",
    "fellow",
    "education",
    "scholar",
  ],
};

const TRACK_KEYWORDS: Record<string, string[]> = {
  [TRACKS[0]]: ["clinical", "patient", "rounds"],
  [TRACKS[1]]: ["teach", "mentor", "resident", "fellow", "education"],
  [TRACKS[3]]: ["lead", "director", "chair", "committee"],
  [TRACKS[6]]: ["quality", "safety", "improvement"],
};

export function classifyActivityFallback(text: string): ClassificationResult {
  const lower = text.toLowerCase();
  let domain: string = DOMAINS[2];
  let track: string = TRACKS[0];
  let bestDomainScore = 0;
  let bestTrackScore = 0;

  for (const [d, words] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestDomainScore) {
      bestDomainScore = score;
      domain = d;
    }
  }

  for (const [t, words] of Object.entries(TRACK_KEYWORDS)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestTrackScore) {
      bestTrackScore = score;
      track = t;
    }
  }

  if (lower.includes("mentor") || lower.includes("teach")) {
    track = TRACKS[1];
    domain = DOMAINS[2];
  }

  const confidence = 0.55 + Math.min(bestDomainScore + bestTrackScore, 3) * 0.1;

  return {
    primary_domain: domain,
    primary_track: track,
    primary_domain_confidence: confidence,
    primary_track_confidence: confidence,
    scope: "team",
    evidence_strength: "self_reported",
    confidence_score: confidence,
    rationale: "Keyword-based classification (add OPENAI_API_KEY for GPT-4).",
  };
}
