import type { CareerGoal } from "@/lib/goals";
import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";
import type { CareerVaultModel } from "@/lib/v2/career-vault";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  formatConfirmedEvidenceForPrompt,
  type ConfirmedEvidenceItem,
} from "@/lib/v2/confirmed-evidence";
import {
  buildCareerNarrativeMakContext,
  buildSectionPrompts,
  defaultApplicationForStage,
  inferCareerNarrativeStageFromLevel,
  normalizeCareerNarrativeTrack,
  resolveSectionsForContext,
} from "@/lib/v2/career-narrative-templates";
import {
  buildCoverLetterMakContext,
  getSectionsForCoverLetterStage,
} from "@/lib/v2/cover-letter-templates";
import {
  buildCoverLetterContextualGuidance,
  inferPositionTypeFromSetting,
  inferSpecialtyCategory,
  normalizeInstitutionalSetting,
  normalizePositionType,
} from "@/lib/v2/cover-letter-guide";
import {
  buildDocumentMakContext,
  getSectionsForDocument,
  normalizeCoreDocumentId,
} from "@/lib/v2/academic-core-document-templates";
import {
  buildTraineeProgramBackgroundForMak,
} from "@/lib/v2/programs/rotation-orientation";
import { getProgramById, getProgramBySlug } from "@/lib/v2/programs/registry";
import {
  buildPromotionTrackMakContext,
  getSectionsForTrack,
  normalizePromotionTrack,
} from "@/lib/v2/promotion-narrative-sections";
import {
  buildIndustryCareerMakContext,
  getSectionsForIndustryDocument,
  INDUSTRY_COVER_LETTER_TIPS,
  INDUSTRY_RECRUITING_SECTORS,
  INDUSTRY_STAGE_POSITIONING,
  INDUSTRY_TRANSITION_TIPS,
  mapPivotPathToIndustry,
  normalizeIndustryCareerStage,
  type IndustryDocumentType,
  type IndustrySectorId,
} from "@/lib/v2/industry-career-templates";
import {
  buildUserOutputTemplateGenerationInstructions,
  resolveUserOutputTemplate,
} from "@/lib/v2/output-user-templates";
import type { CvEvidence } from "@/lib/v2/cv-metrics";
import type { AppUser, DocumentRecord } from "@/lib/v2/types";

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
  /** Confirmed facts only — never proposed reconcile or composite scores. */
  confirmedEvidence: ConfirmedEvidenceItem[];
  developmentThemes: string[];
  cvExcerpt: string | null;
  cvEvidence: CvEvidence | null;
  invisibleWorkHours: number | null;
  lastQuarterlySummary: string | null;
  /** Mak system prompt only — never surface in UI prefill */
  makTraineeBackground?: string;
  /** User-uploaded template for this document type — Mak-only in generation */
  userOutputTemplate?: import("@/lib/v2/output-user-templates").UserOutputTemplate | null;
  industrySectorId?: IndustrySectorId;
  industryStageId?: ReturnType<typeof normalizeIndustryCareerStage>;
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
  confirmedEvidence?: ConfirmedEvidenceItem[];
  cvText?: string | null;
  cvEvidence?: CvEvidence | null;
  readiness?: OutputGenerationContext["readiness"];
  documents?: DocumentRecord[];
}): Promise<OutputGenerationContext> {
  const {
    user,
    meta,
    templateType,
    vault,
    goals,
    confirmedEvidence = [],
    cvText,
    cvEvidence,
    readiness,
    documents = [],
  } = input;

  const delta = enrichmentDeltaSummary(
    meta.enrichment_snapshot,
    meta.previous_enrichment_snapshot,
  );

  const activeGoals = goals.filter((g) => g.status === "active");
  const developmentThemes = activeGoals
    .filter((g) => g.goal_type === "development" || g.goal_type === "sustainability")
    .slice(0, 3)
    .map((g) => g.goal_title);

  const program =
    getProgramById(meta.program_id) ?? getProgramBySlug(meta.program_slug) ?? null;
  const makTraineeBackground =
    meta.onboarding_path === "institutional" && program
      ? buildTraineeProgramBackgroundForMak({
          program,
          currentRotation: user.current_rotation,
          pgyLevel: user.pgy_level,
          traineeInitials: meta.trainee_initials,
          purpose: "output_studio",
        })
      : undefined;

  const userOutputTemplate = resolveUserOutputTemplate(meta, templateType, documents);

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
    goals: activeGoals,
    confirmedEvidence,
    developmentThemes,
    cvExcerpt: cvText ? cvText.slice(0, 2500) : null,
    cvEvidence: cvEvidence ?? null,
    invisibleWorkHours: meta.pulse_history?.[0]?.invisible_hours ?? null,
    lastQuarterlySummary: meta.last_quarterly_summary ?? null,
    makTraineeBackground,
    userOutputTemplate,
    industrySectorId: mapPivotPathToIndustry(meta.career_pivot_context?.target_path),
    industryStageId: normalizeIndustryCareerStage(user.career_stage),
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

function confirmedEvidenceSection(ctx: OutputGenerationContext): string {
  return formatConfirmedEvidenceForPrompt(ctx.confirmedEvidence);
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
    case "career_narrative":
    case "personal_statement":
      return buildCareerNarrativePrefill(ctx);
    case "teaching_statement":
      return buildTeachingStatementPrefill(ctx);
    case "leadership_summary":
      return buildLeadershipPrefill(ctx);
    case "professional_bio":
      return buildBioPrefill(ctx);
    case "cover_letter":
      return buildCoverLetterPrefill(ctx);
    case "industry_resume":
      return buildIndustryDocumentPrefill(ctx, "industry_resume");
    case "industry_cover_letter":
      return buildIndustryDocumentPrefill(ctx, "industry_cover_letter");
    case "invisible_work_summary":
      return buildInvisibleWorkPrefill(ctx);
    case "career_snapshot":
      return buildCareerSnapshotPrefill(ctx);
    case "biosketch":
      return buildBiosketchPrefill(ctx);
    case "institutional_cv":
      return buildInstitutionalCvPrefill(ctx);
    case "teaching_portfolio":
      return buildTeachingPortfolioPrefill(ctx);
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
  if (ctx.confirmedEvidence.length) {
    lines.push("", "CONFIRMED EVIDENCE (cite evidence_id)", confirmedEvidenceSection(ctx));
  }
  if (ctx.developmentThemes.length) {
    lines.push("", "DEVELOPMENT PRIORITIES", ctx.developmentThemes.map((g) => `- ${g}`).join("\n"));
  }
  lines.push(
    "",
    "[Review with Coach Mak to merge new publications, grants, roles, and awards into formatted CV sections.]",
  );
  return lines.join("\n");
}

function buildBiosketchPrefill(ctx: OutputGenerationContext): string {
  const docId = normalizeCoreDocumentId("biosketch");
  const sections = getSectionsForDocument(docId);
  const pubs = ctx.vault?.sections.find((s) => s.id === "publications")?.count ?? 0;
  const grants = ctx.vault?.sections.find((s) => s.id === "grants")?.count ?? 0;
  return [
    "NIH Biosketch Draft",
    buildDocumentMakContext(docId),
    "",
    `Name: ${ctx.name}`,
    `Position: ${ctx.rank ?? "Faculty"} · ${ctx.specialty}`,
    "",
    "Career Data vault",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent progress: ${ctx.enrichmentDelta}` : "",
    `Verified: ${pubs} publications, ${grants} grant records`,
    "",
    ...sections.map(
      (s, i) =>
        `Section ${i + 1}: ${s.title}\n${s.prompts.slice(0, 2).map((p) => `- ${p}`).join("\n")}\n[Draft with Mak — use SciENcv for official submission]`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildInstitutionalCvPrefill(ctx: OutputGenerationContext): string {
  const docId = normalizeCoreDocumentId("institutional_cv");
  const sections = getSectionsForDocument(docId);
  return [
    "Institutional CV Draft",
    buildDocumentMakContext(docId),
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    "",
    "Career Data vault",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent: ${ctx.enrichmentDelta}` : "",
    ctx.cvExcerpt ? `\nCV excerpt:\n${ctx.cvExcerpt.slice(0, 800)}` : "",
    "",
    ...sections.map(
      (s, i) => `Section ${i + 1}: ${s.title}\n[Draft with Mak — check Office of Faculty Affairs format]`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildTeachingPortfolioPrefill(ctx: OutputGenerationContext): string {
  const docId = normalizeCoreDocumentId("teaching_portfolio");
  const sections = getSectionsForDocument(docId);
  const courses = ctx.vault?.sections.find((s) => s.id === "teaching")?.count ?? 0;
  return [
    "Teaching Portfolio Draft",
    buildDocumentMakContext(docId),
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    "",
    `Verified teaching roles: ${courses} in Career Data vault`,
    ctx.cvEvidence
      ? `CV signals: ${ctx.cvEvidence.teaching_signals} teaching mentions, ${ctx.cvEvidence.mentoring_mentions} mentoring references`
      : "",
    vaultSection(ctx),
    "",
    ...sections.map((s, i) => {
      const prompts = s.prompts.slice(0, 2).map((p) => `- ${p}`).join("\n");
      return `Part ${i + 1}: ${s.title}\n${prompts}\n[Draft with Mak]`;
    }),
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
    ctx.confirmedEvidence.length
      ? `\nConfirmed evidence:\n${confirmedEvidenceSection(ctx)}`
      : "",
    "",
    "[Expand each section with Mak using confirmed evidence only.]",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPromotionPrefill(ctx: OutputGenerationContext): string {
  const r = ctx.readiness;
  const trackId = normalizePromotionTrack(r?.target_track);
  const trackSections = getSectionsForTrack(trackId);
  const vaultLine = vaultSection(ctx);
  const enrichment = ctx.enrichmentDelta ? `Recent additions: ${ctx.enrichmentDelta}` : "";

  if (!r) {
    return [
      "Promotion Narrative Draft",
      buildPromotionTrackMakContext(trackId),
      "",
      vaultLine,
      enrichment,
      "",
      ...trackSections.map(
        (s, i) =>
          `Section ${i + 1}: ${s.title}${s.emphasis === "primary" ? " (primary)" : ""}\n[Draft with Mak — ${s.subtitle}]`,
      ),
    ]
      .filter(Boolean)
      .join("\n");
  }

  const strengths = r.strengths.map((s) => `- ${s.domain} (${s.score}%): ${s.note}`).join("\n");
  const gaps = r.gaps
    .map((g) => `- ${g.domain} (${g.score}%): ${g.note}. ${g.suggestion}`)
    .join("\n");

  return [
    "Promotion Narrative Draft",
    "",
    buildPromotionTrackMakContext(trackId),
    "",
    `Target: ${r.target_rank} (${r.target_track})`,
    `Timeline: ${r.promotion_timeline}`,
    `Overall readiness: ${r.overall_readiness}%`,
    "",
    "Career Data vault",
    vaultLine,
    enrichment,
    "",
    "Strengths",
    strengths,
    "",
    "Gaps to address",
    gaps,
    "",
    ...trackSections.map(
      (s, i) =>
        `Section ${i + 1}: ${s.title}${s.emphasis === "primary" ? " (primary domain)" : ""}\n${s.prompts.slice(0, 2).map((p) => `- ${p}`).join("\n")}\n[Draft with Mak]`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCareerNarrativePrefill(ctx: OutputGenerationContext): string {
  const stageId = inferCareerNarrativeStageFromLevel(ctx.level);
  const trackId = normalizeCareerNarrativeTrack(ctx.track);
  const applicationId = defaultApplicationForStage(stageId);
  const sections = resolveSectionsForContext({ stageId, applicationId });

  return [
    "Career Narrative Draft",
    "",
    buildCareerNarrativeMakContext({
      stageId,
      trackId,
      applicationId,
      specialty: ctx.specialty,
    }),
    "",
    ctx.profileLine,
    ctx.careerObjective ? `Career objective: ${ctx.careerObjective}` : "",
    "",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent captures: ${ctx.enrichmentDelta}` : "",
    "",
    ...sections.map((s, i) => {
      const prompts = buildSectionPrompts({
        sectionId: s.id,
        stageId,
        trackId,
        applicationId,
        specialty: ctx.specialty,
      });
      return `Section ${i + 1}: ${s.title}\n${prompts.slice(0, 3).map((p) => `- ${p}`).join("\n")}\n[Draft with Mak]`;
    }),
  ]
    .filter(Boolean)
    .join("\n");
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
  const stageId = inferCareerNarrativeStageFromLevel(ctx.level);
  const sections = getSectionsForCoverLetterStage(stageId);
  const positionType = normalizePositionType(inferPositionTypeFromSetting(ctx.setting));
  const institutionalSetting = normalizeInstitutionalSetting(null);
  const specialtyCategory = inferSpecialtyCategory(ctx.specialty);
  const guide = buildCoverLetterContextualGuidance({
    stageId,
    positionType,
    institutionalSetting,
    specialtyCategory,
  });
  return [
    "Physician CV Cover Letter Draft",
    buildCoverLetterMakContext({
      stageId,
      specialty: ctx.specialty,
      positionType,
      institutionalSetting,
      specialtyCategory,
    }),
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    `Position type: ${positionType.replace(/_/g, " ")}`,
    `Narrative arc: ${guide.narrativeArc}`,
    ctx.careerObjective ? `Career objective: ${ctx.careerObjective}` : "",
    "",
    "Career Data vault",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent: ${ctx.enrichmentDelta}` : "",
    "",
    "Position-specific guidance:",
    ...guide.position.slice(0, 3).map((p) => `- ${p}`),
    "",
    ...sections.map(
      (s, i) =>
        `Section ${i + 1}: ${s.title}\n${s.prompts.slice(0, 2).map((p) => `- ${p}`).join("\n")}\n[Draft with Mak — one page total]`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildIndustryDocumentPrefill(
  ctx: OutputGenerationContext,
  documentType: IndustryDocumentType,
): string {
  const stageId =
    ctx.industryStageId ?? normalizeIndustryCareerStage(inferCareerNarrativeStageFromLevel(ctx.level));
  const sectorId = ctx.industrySectorId ?? "ai_health_tech";
  const sector = INDUSTRY_RECRUITING_SECTORS.find((s) => s.id === sectorId)!;
  const stage = INDUSTRY_STAGE_POSITIONING[stageId];
  const sections = getSectionsForIndustryDocument(documentType, sectorId);
  const docLabel =
    documentType === "industry_resume" ? "Physician Industry Resume Draft" : "Physician Industry Cover Letter Draft";

  return [
    docLabel,
    buildIndustryCareerMakContext({
      documentType,
      sectorId,
      stageId,
      specialty: ctx.specialty,
    }),
    "",
    `${ctx.name} · ${ctx.profileLine}`,
    `Target sector: ${sector.label}`,
    `Career stage: ${stage?.label ?? stageId}`,
    ctx.careerObjective ? `Career objective: ${ctx.careerObjective}` : "",
    "",
    "Transition tips:",
    ...INDUSTRY_TRANSITION_TIPS.slice(0, 3).map((t) => `- ${t}`),
    "",
    ...(documentType === "industry_cover_letter"
      ? [
          "Sector cover letter tips:",
          ...(INDUSTRY_COVER_LETTER_TIPS[sectorId]?.slice(0, 2).map((t) => `- ${t}`) ?? []),
          "",
        ]
      : [
          "Stage resume tips:",
          ...(stage?.resumeTips.slice(0, 2).map((t) => `- ${t}`) ?? []),
          "",
        ]),
    "Career Data vault",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent: ${ctx.enrichmentDelta}` : "",
    "",
    ...sections.map(
      (s, i) =>
        `Section ${i + 1}: ${s.title}\n${s.prompts.slice(0, 2).map((p) => `- ${p}`).join("\n")}\n[Draft with Mak — ${documentType === "industry_resume" ? "1–2 pages total" : "one page total"}]`,
    ),
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
    `Objective: ${ctx.careerObjective}`,
    "",
    vaultSection(ctx),
    ctx.enrichmentDelta ? `Recent: ${ctx.enrichmentDelta}` : "",
    ctx.confirmedEvidence.length
      ? `\nConfirmed evidence:\n${confirmedEvidenceSection(ctx)}`
      : "",
    "",
    "Active goals",
    goalLines(ctx.goals),
    ctx.developmentThemes.length
      ? `\nDevelopment priorities: ${ctx.developmentThemes.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOutputGenerationPrompt(ctx: OutputGenerationContext): string {
  const prefill = buildOutputPrefill(ctx);
  const userTemplateBlock = ctx.userOutputTemplate
    ? `\n\n${buildUserOutputTemplateGenerationInstructions(ctx.userOutputTemplate, ctx.templateType)}\n`
    : "";
  return `Generate a professional ${ctx.templateType.replace(/_/g, " ")} for an academic physician.

Profile: ${ctx.profileLine}
Career objective: ${ctx.careerObjective}
Career Data vault: ${vaultSection(ctx)}
${ctx.enrichmentDelta ? `Changes since last quarter: ${ctx.enrichmentDelta}` : ""}

CONFIRMED EVIDENCE (every factual claim must cite an evidence_id from this list, or mark [needs source]):
${confirmedEvidenceSection(ctx)}

Development themes: ${ctx.developmentThemes.join("; ") || "none identified"}

Active goals:
${goalLines(ctx.goals)}

RULES: Do not invent publications, roles, or metrics. Never mention Career Health Score, percentiles, or wellbeing scores. Cite facts with [evidence_id] inline (e.g. [recon-pubmed-publications]) matching the CONFIRMED EVIDENCE list.
${ctx.makTraineeBackground ? `${ctx.makTraineeBackground}\n\n` : ""}${userTemplateBlock}${ctx.userOutputTemplate ? "Populate the user's uploaded template structure — preserve their headings and section order." : "Expand this draft into polished prose appropriate for academic medicine:"}

${prefill}`;
}
