import type { CareerGoal } from "@/lib/goals";
import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";
import type { CareerVaultModel } from "@/lib/v2/career-vault";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser } from "@/lib/v2/types";
import type { CvEvidence } from "@/lib/v2/cv-metrics";

export type OutputGenerationContext = {
  templateType: string;
  profileLine: string;
  name: string;
  specialty: string;
  careerObjective: string;
  rank: string | null;
  track: string | null;
  setting: string | null;
  level: string | null;
  vault: CareerVaultModel | null;
  enrichmentDelta: string | null;
  reconciliationPending: number;
  goals: CareerGoal[];
  health: CareerHealthView | null;
  developmentGaps: string[];
  cvExcerpt: string | null;
  cvEvidence: CvEvidence | null;
  invisibleWorkHours: number | null;
  lastQuarterlySummary: string | null;
  readiness?: {
    target_rank: string;
    target_track: string;
    overall_readiness: number;
    promotion_timeline: string;
    strengths: { domain: string; score: number; note: string }[];
    gaps: { domain: string; score: number; note: string; suggestion: string }[];
  } | null;
};

export function enrichmentDeltaSummary(
  current: EnrichmentSnapshot | null | undefined,
  previous: EnrichmentSnapshot | null | undefined,
): string | null {
  if (current?.changes_summary) return current.changes_summary;
  if (!current || !previous) return null;
  const parts: string[] = [];
  const pub = current.publications_detected - previous.publications_detected;
  if (pub > 0) parts.push(`+${pub} publication${pub > 1 ? "s" : ""}`);
  const grants = current.grants_detected - previous.grants_detected;
  if (grants > 0) parts.push(`+${grants} grant${grants > 1 ? "s" : ""}`);
  const committees = current.committees_detected - previous.committees_detected;
  if (committees > 0) parts.push(`+${committees} committee role${committees > 1 ? "s" : ""}`);
  const courses = current.courses_detected - previous.courses_detected;
  if (courses > 0) parts.push(`+${courses} teaching role${courses > 1 ? "s" : ""}`);
  return parts.length ? `${parts.join(", ")} since last enrichment` : null;
}

export async function buildOutputGenerationContext(input: {
  user: AppUser;
  meta: OnboardingMetadata;
  templateType: string;
  vault: CareerVaultModel | null;
  goals: CareerGoal[];
  health: CareerHealthView | null;
  cvText?: string | null;
  cvEvidence?: CvEvidence | null;
  readiness?: OutputGenerationContext["readiness"];
}): Promise<OutputGenerationContext> {
  const { user, meta, templateType, vault, goals, health, cvText, cvEvidence, readiness } =
    input;

  const delta = enrichmentDeltaSummary(
    meta.enrichment_snapshot,
    meta.previous_enrichment_snapshot,
  );

  const weakDomains =
    health?.domains.slice().sort((a, b) => a.score - b.score).slice(0, 2) ?? [];

  const profileParts = [
    user.specialty,
    user.practice_setting === "Academic" ? "Academic Medicine" : user.practice_setting,
    user.academic_rank ?? user.career_stage,
    user.primary_career_track,
  ].filter(Boolean);

  return {
    templateType,
    profileLine: profileParts.join(" · "),
    name: user.name ?? "Physician",
    specialty: user.specialty ?? "Medicine",
    careerObjective: meta.career_objective ?? "stated 3-year career objective",
    rank: user.academic_rank,
    track: user.primary_career_track,
    setting: user.practice_setting,
    level: user.career_stage,
    vault,
    enrichmentDelta: delta ?? vault?.changes_since_quarter ?? null,
    reconciliationPending: vault?.pending_review ?? 0,
    goals: goals.filter((g) => g.status === "active"),
    health,
    developmentGaps: weakDomains.map((d) => `${d.label} (${d.score})`),
    cvExcerpt: cvText ? cvText.slice(0, 2500) : null,
    cvEvidence: cvEvidence ?? null,
    invisibleWorkHours: meta.pulse_history?.[0]?.invisible_hours ?? null,
    lastQuarterlySummary: meta.last_quarterly_summary ?? null,
    readiness: readiness ?? null,
  };
}

function goalLines(goals: CareerGoal[]): string {
  if (!goals.length) return "No active goals on file.";
  return goals
    .map((g) => `- ${g.goal_title}${g.why_this_fits ? `: ${g.why_this_fits}` : ""}`)
    .join("\n");
}

function vaultSection(ctx: OutputGenerationContext): string {
  if (!ctx.vault?.sections.length) return "Career Data vault pending — upload CV and run enrichment.";
  return ctx.vault.sections.map((s) => `${s.label}: ${s.count}`).join(" · ");
}

export function buildOutputPrefill(ctx: OutputGenerationContext): string {
  const academic = isAcademicContext({
    setting: ctx.setting as AppUser["practice_setting"],
    level: ctx.level as AppUser["career_stage"],
  })
    ? resolveAcademicProfile({
        setting: ctx.setting as AppUser["practice_setting"],
        level: ctx.level as AppUser["career_stage"],
        rank: ctx.rank as AppUser["academic_rank"],
        track: ctx.track,
      })
    : null;

  switch (ctx.templateType) {
    case "cv":
    case "cv_academic":
    case "cv_bullets":
    case "cv_update":
      return buildCvPrefill(ctx, academic?.outputTemplates[0] ?? "Academic CV");
    case "annual_review":
      return buildAnnualReviewPrefill(ctx);
    case "promotion_narrative":
      return buildPromotionPrefill(ctx);
    case "teaching_statement":
      return buildTeachingStatementPrefill(ctx);
    case "leadership_summary":
      return buildLeadershipPrefill(ctx);
    case "professional_bio":
      return buildBioPrefill(ctx);
    case "cover_letter":
      return buildCoverLetterPrefill(ctx);
    case "invisible_work_summary":
      return buildInvisibleWorkPrefill(ctx);
    case "career_snapshot":
      return buildCareerSnapshotPrefill(ctx);
    case "biosketch":
      return buildBiosketchPrefill(ctx);
    default:
      return buildCareerSnapshotPrefill(ctx);
  }
}

function buildCvPrefill(ctx: OutputGenerationContext, docLabel: string): string {
  const lines: string[] = [
    `${docLabel} — ${ctx.name}`,
    ctx.profileLine,
    "",
    "CAREER DATA VAULT (verified)",
    vaultSection(ctx),
  ];
  if (ctx.enrichmentDelta) {
    lines.push("", "CHANGES SINCE LAST QUARTER", ctx.enrichmentDelta);
  }
  if (ctx.cvExcerpt) {
    lines.push("", "CURRENT CV EXCERPT (update and reconcile)", ctx.cvExcerpt.slice(0, 1200));
  }
  if (ctx.reconciliationPending > 0) {
    lines.push(
      "",
      `Note: ${ctx.reconciliationPending} enrichment item(s) pending review in Career Data → Reconcile.`,
    );
  }
  lines.push("", "ACTIVE CAREER GOALS", goalLines(ctx.goals));
  if (ctx.developmentGaps.length) {
    lines.push("", "DEVELOPMENT PRIORITIES", ctx.developmentGaps.map((g) => `- ${g}`).join("\n"));
  }
  lines.push(
    "",
    "[Review with Coach Mak to merge new publications, grants, roles, and awards into formatted CV sections.]",
  );
  return lines.join("\n");
}

function buildBiosketchPrefill(ctx: OutputGenerationContext): string {
  const pubs = ctx.vault?.sections.find((s) => s.id === "publications")?.count ?? 0;
  const grants = ctx.vault?.sections.find((s) => s.id === "grants")?.count ?? 0;
  return [
    "NIH Biosketch Draft",
    "",
    `Name: ${ctx.name}`,
    `Position: ${ctx.rank ?? "Faculty"} · ${ctx.specialty}`,
    `Career objective: ${ctx.careerObjective}`,
    "",
    "Personal Statement",
    `Physician-scientist/educator in ${ctx.specialty} with ${pubs} verified publications and ${grants} active grant records in Career Data vault.`,
    ctx.enrichmentDelta ? `Recent progress: ${ctx.enrichmentDelta}.` : "",
    "",
    "Contributions to Science",
    "[Mak will help draft 4 contributions from vault publications and grants.]",
    "",
    "Active Goals",
    goalLines(ctx.goals),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAnnualReviewPrefill(ctx: OutputGenerationContext): string {
  return [
    `Annual Review — ${ctx.name}`,
    ctx.profileLine,
    "",
    ctx.lastQuarterlySummary
      ? `Recent quarterly summary:\n${ctx.lastQuarterlySummary}`
      : "Quarterly pulse summaries will appear here after check-ins.",
    "",
    "Career Data accomplishments",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Changes since last quarter: ${ctx.enrichmentDelta}` : "",
    "",
    "Goal progress",
    goalLines(ctx.goals),
    ctx.health
      ? `\nCareer Health Score: ${ctx.health.career_health_score}/100`
      : "",
    "",
    "[Expand each section with Mak using evidence from Career Data vault.]",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPromotionPrefill(ctx: OutputGenerationContext): string {
  const r = ctx.readiness;
  if (!r) {
    return buildCvPrefill(ctx, "Promotion Dossier Narrative");
  }
  const strengths = r.strengths.map((s) => `- ${s.domain} (${s.score}%): ${s.note}`).join("\n");
  const gaps = r.gaps
    .map((g) => `- ${g.domain} (${g.score}%): ${g.note}. ${g.suggestion}`)
    .join("\n");
  return [
    "Promotion Narrative Draft",
    "",
    `Target: ${r.target_rank} (${r.target_track})`,
    `Timeline: ${r.promotion_timeline}`,
    `Overall readiness: ${r.overall_readiness}%`,
    "",
    "Career Data vault",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent additions: ${ctx.enrichmentDelta}` : "",
    "",
    "Strengths",
    strengths,
    "",
    "Gaps to address",
    gaps,
    "",
    "Section 1: Clinical Excellence",
    "[Draft with Mak]",
    "",
    "Section 2: Teaching & Mentorship",
    `[Teaching portfolio: ${ctx.vault?.sections.find((s) => s.id === "teaching")?.count ?? 0} courses]`,
    "",
    "Section 3: Scholarship & Research",
    `[Publications: ${ctx.vault?.sections.find((s) => s.id === "publications")?.count ?? 0}; Grants: ${ctx.vault?.sections.find((s) => s.id === "grants")?.count ?? 0}]`,
    "",
    "Section 4: Service & Leadership",
    `[Committees: ${ctx.vault?.sections.find((s) => s.id === "committees")?.count ?? 0}]`,
    "",
    "Section 5: Career Vision",
    ctx.careerObjective,
    "",
    "Section 6: Summary",
    "[Draft with Mak]",
  ].join("\n");
}

function buildTeachingStatementPrefill(ctx: OutputGenerationContext): string {
  const courses = ctx.vault?.sections.find((s) => s.id === "teaching")?.count ?? 0;
  return [
    "Teaching Statement",
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    "",
    `Career objective: ${ctx.careerObjective}`,
    "",
    `Verified teaching portfolio: ${courses} course/director roles in Career Data vault.`,
    ctx.cvEvidence
      ? `CV signals: ${ctx.cvEvidence.teaching_signals} teaching mentions, ${ctx.cvEvidence.mentoring_mentions} mentoring references.`
      : "",
    "",
    "Philosophy",
    "[Describe approach to learner-centered teaching and assessment.]",
    "",
    "Evidence",
    vaultSection(ctx),
    "",
    "Goals",
    goalLines(ctx.goals.filter((g) => g.goal_type === "development" || g.goal_type === "maintenance")),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildLeadershipPrefill(ctx: OutputGenerationContext): string {
  const committees = ctx.vault?.sections.find((s) => s.id === "committees")?.count ?? 0;
  return [
    "Leadership Summary",
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    "",
    `Committee and service roles (verified): ${committees}`,
    ctx.cvEvidence ? `Leadership signals in CV: ${ctx.cvEvidence.leadership_roles}` : "",
    "",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent: ${ctx.enrichmentDelta}` : "",
    "",
    goalLines(ctx.goals),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildBioPrefill(ctx: OutputGenerationContext): string {
  const pubs = ctx.vault?.sections.find((s) => s.id === "publications")?.count ?? 0;
  return `${ctx.name} is a ${ctx.rank ?? "physician"} in ${ctx.specialty} (${ctx.profileLine}). ${pubs ? `Their verified portfolio includes ${pubs} publications` : "Their Career Data vault is being populated from CV and API enrichment"}. Career focus: ${ctx.careerObjective}.`;
}

function buildCoverLetterPrefill(ctx: OutputGenerationContext): string {
  return [
    `[Date]`,
    "",
    "Dear Search Committee,",
    "",
    `I am writing to express interest in an academic ${ctx.specialty} position aligned with my ${ctx.track ?? "clinical"} track and goal: ${ctx.careerObjective}.`,
    "",
    "Career Data highlights",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent accomplishments: ${ctx.enrichmentDelta}.` : "",
    "",
    goalLines(ctx.goals),
    "",
    "Sincerely,",
    ctx.name,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildInvisibleWorkPrefill(ctx: OutputGenerationContext): string {
  const hours = ctx.invisibleWorkHours;
  const recs = ctx.goals.filter((g) => g.goal_type === "sustainability");
  return [
    "Unrecognized Work Summary",
    "",
    ctx.profileLine,
    hours != null ? `Current pulse estimate: ~${hours} hours/week unrecognized work.` : "",
    "",
    "Sustainability goals",
    recs.length ? goalLines(recs) : goalLines(ctx.goals),
    "",
    "[Document categories: documentation overspill, care coordination, uncompensated teaching, administrative burden, DEI service, professional maintenance.]",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCareerSnapshotPrefill(ctx: OutputGenerationContext): string {
  return [
    "Career Snapshot",
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    ctx.health ? `Career Health Score: ${ctx.health.career_health_score}/100` : "",
    `Objective: ${ctx.careerObjective}`,
    "",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent: ${ctx.enrichmentDelta}` : "",
    "",
    "Active goals",
    goalLines(ctx.goals),
    ctx.developmentGaps.length
      ? `\nDevelopment areas: ${ctx.developmentGaps.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOutputGenerationPrompt(ctx: OutputGenerationContext): string {
  const prefill = buildOutputPrefill(ctx);
  return `Generate a professional ${ctx.templateType.replace(/_/g, " ")} for an academic physician.

Profile: ${ctx.profileLine}
Career objective: ${ctx.careerObjective}
Career Data vault: ${vaultSection(ctx)}
${ctx.enrichmentDelta ? `Changes since last quarter: ${ctx.enrichmentDelta}` : ""}
${ctx.health ? `Career Health Score: ${ctx.health.career_health_score}/100` : ""}
Development gaps: ${ctx.developmentGaps.join("; ") || "none identified"}

Active goals:
${goalLines(ctx.goals)}

Use ONLY evidence from the Career Data vault and context above. Do not invent publications or grants.
Expand this draft into polished prose appropriate for academic medicine:

${prefill}`;
}
