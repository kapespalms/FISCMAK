import universalCompetencies from "../../../../docs/seeds/acgme/universal_core_competencies.json";
import { DOMAINS, TRACKS } from "@/lib/constants";

export const ACGME_COMPETENCIES = universalCompetencies.competencies.map((c) => ({
  key: c.key,
  name: c.short_name,
  fullName: c.name,
}));

export const ACGME_LEVELS = [
  { level: 1, label: "Level 1", description: "Novice / observer" },
  { level: 2, label: "Level 2", description: "Advanced beginner" },
  { level: 3, label: "Level 3", description: "Competent / independent" },
  { level: 4, label: "Level 4", description: "Proficient / teacher" },
  { level: 5, label: "Level 5", description: "Expert / role model" },
] as const;

/** FISCMAK 8×8 domain labels */
export { DOMAINS, TRACKS };

/** ACGME competency key → FISCMAK domain index */
export const ACGME_TO_FISCMAK_DOMAIN: Record<string, number> = {
  pc: 0,
  mk: 4,
  pbli: 4,
  ics: 1,
  prof: 2,
  sbp: 3,
};

/** Signal / keyword → FISCMAK placement */
export const KEYWORD_FISCMAK: Array<{
  keywords: string[];
  domainIndex: number;
  trackIndex: number;
  acgmeKey: string;
  baseLevel: number;
}> = [
  // Teaching and mentoring rules come before residency/rotation so that
  // "residency curriculum" or "trainee supervision" text is not swallowed
  // by the broad clinical training keywords.
  { keywords: ["teach", "lecture", "curriculum", "learner"], domainIndex: 4, trackIndex: 1, acgmeKey: "pbli", baseLevel: 3 },
  { keywords: ["mentor", "coaching", "sponsor", "trainee"], domainIndex: 7, trackIndex: 1, acgmeKey: "ics", baseLevel: 3 },
  { keywords: ["patient", "clinical", "diagnosis", "treatment", "rounds"], domainIndex: 0, trackIndex: 0, acgmeKey: "pc", baseLevel: 3 },
  {
    keywords: [
      "residency",
      "rotat",
      "inpatient",
      "outpatient",
      "clerkship",
      "hospitalist",
    ],
    domainIndex: 0,
    trackIndex: 0,
    acgmeKey: "pc",
    baseLevel: 3,
  },
  { keywords: ["research", "publication", "grant", "manuscript", "scholar"], domainIndex: 4, trackIndex: 2, acgmeKey: "mk", baseLevel: 3 },
  { keywords: ["committee", "lead", "director", "chair", "administration"], domainIndex: 6, trackIndex: 3, acgmeKey: "sbp", baseLevel: 4 },
  { keywords: ["quality", "safety", "qi", "improvement", "protocol"], domainIndex: 3, trackIndex: 6, acgmeKey: "sbp", baseLevel: 3 },
  { keywords: ["advocacy", "equity", "policy", "community", "underserved"], domainIndex: 3, trackIndex: 4, acgmeKey: "sbp", baseLevel: 3 },
  { keywords: ["family meeting", "communication", "collateral", "debrief"], domainIndex: 1, trackIndex: 0, acgmeKey: "ics", baseLevel: 3 },
  { keywords: ["ethics", "professional", "consent", "confidential"], domainIndex: 2, trackIndex: 0, acgmeKey: "prof", baseLevel: 3 },
  { keywords: ["innovation", "informatic", "digital", "technology"], domainIndex: 3, trackIndex: 5, acgmeKey: "pbli", baseLevel: 4 },
  { keywords: ["wellness", "burnout", "self-care", "resilience"], domainIndex: 7, trackIndex: 7, acgmeKey: "prof", baseLevel: 2 },
  { keywords: ["team", "interdisciplinary", "collaborat"], domainIndex: 5, trackIndex: 0, acgmeKey: "ics", baseLevel: 3 },
];

export function normalizeFiscmakDomain(value: string | null | undefined): number {
  if (!value) return -1;
  const exact = DOMAINS.indexOf(value as (typeof DOMAINS)[number]);
  if (exact >= 0) return exact;
  const lower = value.toLowerCase();
  const idx = DOMAINS.findIndex((d) => lower.includes(d.split(" ")[0]!.toLowerCase()));
  return idx >= 0 ? idx : -1;
}

export function normalizeFiscmakTrack(value: string | null | undefined): number {
  if (!value) return -1;
  const exact = TRACKS.indexOf(value as (typeof TRACKS)[number]);
  if (exact >= 0) return exact;
  const lower = value.toLowerCase();
  if (lower.includes("educat")) return 1;
  if (lower.includes("research")) return 2;
  if (lower.includes("admin") || lower.includes("leader")) return 3;
  if (lower.includes("advoc")) return 4;
  if (lower.includes("innov")) return 5;
  if (lower.includes("quality") || lower.includes("safety")) return 6;
  if (lower.includes("wellness")) return 7;
  if (lower.includes("clinic")) return 0;
  return -1;
}

export function inferDevelopmentLevel(text: string, baseLevel = 2): number {
  const lower = text.toLowerCase();
  if (/\b(created|designed|led department|program director|national|expert|role model)\b/.test(lower)) {
    return 5;
  }
  if (/\b(led|managed|directed|supervised|taught|presented|published)\b/.test(lower)) {
    return 4;
  }
  if (/\b(independently|performed|conducted|evaluated|implemented)\b/.test(lower)) {
    return 3;
  }
  if (/\b(participated|assisted|observed|with guidance)\b/.test(lower)) {
    return 2;
  }
  return Math.min(5, Math.max(1, baseLevel));
}

export function keywordPlacement(text: string): {
  domainIndex: number;
  trackIndex: number;
  acgmeKey: string;
  developmentLevel: number;
} | null {
  const lower = text.toLowerCase();
  for (const rule of KEYWORD_FISCMAK) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return {
        domainIndex: rule.domainIndex,
        trackIndex: rule.trackIndex,
        acgmeKey: rule.acgmeKey,
        developmentLevel: inferDevelopmentLevel(text, rule.baseLevel),
      };
    }
  }
  return null;
}

export function acgmeLevelIndex(level: number): number {
  return Math.min(4, Math.max(0, Math.round(level) - 1));
}
