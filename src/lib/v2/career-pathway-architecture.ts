/**
 * Career pathway architecture — layered physician-career intelligence for Coach Mak.
 * Source: docs/FISCMAK_AI_CAREER_PATHWAY_ARCHITECTURE.md
 *
 * Adds trajectory nuance as context (not a second system prompt). Complements
 * content-pack stage voice, Ibarra/GROW blocks, and MECE coaching signals.
 */

import {
  careerLevelAspirationPrompt,
  invisibleWorkExamples,
} from "@/lib/v2/career-language";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  normalizeCareerStage,
  type CareerConversationStage,
} from "@/lib/v2/mak-conversation-models";
import { resolveProfileContractFromUser } from "@/lib/v2/profile-contract";
import { getProgramById } from "@/lib/v2/programs/registry";
import type { AppUser } from "@/lib/v2/types";

/** Compact doctrine — always safe to inject; no framework names to users. */
export const PATHWAY_PROCESSING_DOCTRINE = `Career pathway architecture (internal):
Medicine builds the physician; FISCMAK builds career infrastructure around them.
Reason through: career stage → training level → specialty → program length → signup type → practice setting → hidden context → invisible work → skills → evidence → career tracks → strategic next use.
PGY level alone is never enough — always interpret PGY through specialty and program length. A PGY3 may be final-year in one specialty and mid-training in another.
Learn local program vocabulary over time (call, rotation, committee) — ask one or two clarifying questions when terms are ambiguous, then remember. Never treat one user's definition as universal institutional truth.
Borrow professional-services scaffolding (evidence histories, sponsorship, career lattices) — reject up-or-out pressure, surveillance, utilization worship, and performative productivity.
Institution-affiliated users: developmental support aligned with program structures — never punitive evaluation from private reflections. Private reflections stay private unless the physician chooses to share.`;

type StagePressure = {
  pressures: string;
  emphasis: string;
  dashboardQuestion: string;
  outputPriorities: string;
};

const STAGE_PRESSURES: Partial<Record<string, StagePressure>> = {
  "Medical Student": {
    pressures: "Clinical rotations, specialty exploration, subjective evaluation, identity formation.",
    emphasis: "Specialty fit, reflection, feedback capture, early evidence building.",
    dashboardQuestion: "What clinical experiences are shaping your specialty direction?",
    outputPriorities: "Rotation reflections, early CV, letter-writer notes, specialty-fit summaries.",
  },
  Resident: {
    pressures: "Autonomy growth, call/rotation complexity, feedback integration, scholarly/QI expectations.",
    emphasis: "Clinical confidence, hidden work capture, teaching identity, fellowship/job curiosity.",
    dashboardQuestion: "What are you learning about becoming a doctor?",
    outputPriorities: "CV bullets, teaching portfolio, scholarly/QI tracking, milestone reflection, ILP evidence.",
  },
  Fellow: {
    pressures: "Subspecialty mastery, scholarly trajectory, transition planning, mentor mapping.",
    emphasis: "Niche specificity, evidence packaging, job/fellowship readiness.",
    dashboardQuestion: "What evidence are you carrying into your next role?",
    outputPriorities: "Fellowship/job applications, attending CV, teaching statement, cover letters.",
  },
  "Early Career (0–7 yr)": {
    pressures: "First independent practice, promotion track formation, boundary-setting, invisible work surge.",
    emphasis: "Impact translation, promotion domains, mentorship map, negotiation readiness.",
    dashboardQuestion: "What kind of physician are you becoming now that training is over?",
    outputPriorities: "Annual review packet, promotion readiness, mentorship map, first-year reflection.",
  },
  "Mid-Career (8–20 yr)": {
    pressures: "Leadership expansion, administrative burden peak, national reputation, mid-career burnout risk.",
    emphasis: "Leverage, visibility, boundaries, sustained excellence narrative.",
    dashboardQuestion: "What work deserves more leverage, visibility, or boundaries?",
    outputPriorities: "Promotion packet, leadership bio, program impact summary, executive resume.",
  },
  "Late Career (20+ yr)": {
    pressures: "Legacy, succession, institutional influence, selective engagement.",
    emphasis: "Legacy portfolio, mentorship record, strategic impact over volume.",
    dashboardQuestion: "What legacy are you building or transferring?",
    outputPriorities: "Legacy portfolio, succession planning, institutional impact summary, advisory profile.",
  },
  Retired: {
    pressures: "Identity after active practice, selective contribution, wisdom transfer.",
    emphasis: "Advisory roles, mentorship, legacy narrative — intentional and optional.",
    dashboardQuestion: "What wisdom, mentorship, or contribution do you want to preserve?",
    outputPriorities: "Legacy narrative, advisory bio, mentorship profile, reflection archive.",
  },
};

const PGY_PRESSURES: Record<string, Partial<StagePressure>> = {
  PGY1: {
    pressures: "Student-to-doctor transition, supervision, documentation, call, identity shock.",
    emphasis: "Reliability, communication, adaptation, early reflection — survival as evidence.",
    dashboardQuestion: "What are you learning about becoming a doctor?",
  },
  PGY2: {
    pressures: "Increasing autonomy, deeper specialty identity, call complexity.",
    emphasis: "Autonomy growth, hidden work capture, early leadership experiments.",
    dashboardQuestion: "Where are you gaining autonomy?",
  },
  PGY3: {
    pressures: "May be final year or mid-training — interpret through program length.",
    emphasis: "Seniority signals, teaching, fellowship/job planning when appropriate.",
    dashboardQuestion: "What patterns are emerging in your clinical identity?",
  },
  "PGY4+": {
    pressures: "Chief/senior training, board prep, transition to attending or fellowship.",
    emphasis: "Evidence packaging, leadership narrative, next-role readiness.",
    dashboardQuestion: "What evidence are you carrying into your next role?",
  },
};

/** Local vocabulary follow-ups — one or two questions at a time, not interrogation. */
export const LOCAL_VOCABULARY_FOLLOW_UPS: Record<string, string> = {
  call: "What kind of call is this in your program, how long is it, and what services are covered?",
  rotation: "What site or service was this and what were your main responsibilities?",
  moonlighting:
    "Was it internal or external, supervised or independent, paid, and what clinical setting?",
  committee: "What role did you play — member, organizer, representative, leader, or advocate?",
  recruitment:
    "Were you interviewing, hosting, reviewing applicants, advising, giving tours, or organizing?",
  didactics: "Were you attending, teaching, designing curriculum, evaluating, or giving feedback?",
  mentorship: "Was this formal or informal, one-time or recurring, peer or hierarchical?",
  burnout:
    "Was the strain from volume, acuity, schedule, culture, moral distress, documentation, or lack of control?",
  conflict:
    "Was this interpersonal, systems-based, ethical, supervisory, or patient/family-related?",
  qi: "Did you identify the problem, collect data, change workflow, or present outcomes?",
};

const PROGRAM_LENGTH_BY_SPECIALTY: Array<{ match: RegExp; years: number }> = [
  { match: /psychiatr|neurolog|dermatolog|physical medicine|pm&r|rehab/i, years: 4 },
  { match: /surgery|orthop|urolog|neurosurg|cardiothoracic|plastic|otolaryng/i, years: 5 },
  { match: /internal medicine|pediatric|family medicine|emergency|pathology|radiology|anesthes/i, years: 3 },
];

export function inferProgramLengthYears(
  specialty: string | null | undefined,
  programSlug?: string | null,
): number | null {
  if (programSlug === "uh-psych-cmc") return 4;
  const s = specialty ?? "";
  for (const { match, years } of PROGRAM_LENGTH_BY_SPECIALTY) {
    if (match.test(s)) return years;
  }
  return isTraineeSpecialty(s) ? 3 : null;
}

function isTraineeSpecialty(specialty: string): boolean {
  return Boolean(specialty.trim());
}

export function inferTrainingLevelLabel(user: Pick<AppUser, "career_stage" | "pgy_level">): string {
  if (user.pgy_level?.trim()) return user.pgy_level.trim();
  return user.career_stage ?? "unknown";
}

function pgyBand(pgyLevel: string | null | undefined): keyof typeof PGY_PRESSURES | null {
  if (!pgyLevel) return null;
  const n = pgyLevel.match(/(\d+)/);
  if (!n) return null;
  const year = Number(n[1]);
  if (year <= 1) return "PGY1";
  if (year === 2) return "PGY2";
  if (year === 3) return "PGY3";
  return "PGY4+";
}

function stagePressureBlock(
  careerStage: string | null | undefined,
  pgyLevel: string | null | undefined,
): StagePressure | null {
  const base = careerStage ? STAGE_PRESSURES[careerStage] : null;
  const pgyKey = pgyBand(pgyLevel);
  const pgy = pgyKey ? PGY_PRESSURES[pgyKey] : null;
  if (!base && !pgy) return null;
  return {
    pressures: [pgy?.pressures, base?.pressures].filter(Boolean).join(" "),
    emphasis: [pgy?.emphasis, base?.emphasis].filter(Boolean).join(" "),
    dashboardQuestion: pgy?.dashboardQuestion ?? base?.dashboardQuestion ?? "",
    outputPriorities: base?.outputPriorities ?? "",
  };
}

export type CareerStageCardSnapshot = {
  signup_type: "public" | "institutional";
  career_stage: string;
  training_level: string;
  specialty: string | null;
  program_length_years: number | null;
  institution: string | null;
  practice_setting: string | null;
  primary_career_track: string | null;
  mak_stage: CareerConversationStage;
  content_pack: string;
  developmental_priorities: string;
  invisible_work_lens: string;
};

export function buildCareerStageCardSnapshot(
  user: Pick<
    AppUser,
    | "career_stage"
    | "pgy_level"
    | "specialty"
    | "base_specialty"
    | "subspecialty"
    | "institution"
    | "practice_setting"
    | "primary_career_track"
    | "primary_program_id"
    | "onboarding_metadata"
  >,
  meta?: OnboardingMetadata,
): CareerStageCardSnapshot | null {
  if (!user.career_stage) return null;

  const onboarding = meta ?? ((user.onboarding_metadata ?? {}) as OnboardingMetadata);
  const program =
    (user.primary_program_id ? getProgramById(user.primary_program_id) : null) ??
    (onboarding.program_id ? getProgramById(onboarding.program_id) : null);
  const signup_type =
    onboarding.onboarding_path === "institutional" || onboarding.program_membership
      ? "institutional"
      : "public";

  const specialty =
    user.subspecialty?.trim() ||
    user.base_specialty?.trim() ||
    user.specialty?.trim() ||
    program?.base_specialty ||
    null;

  const contract = resolveProfileContractFromUser(user);
  const pressure = stagePressureBlock(user.career_stage, user.pgy_level);

  return {
    signup_type,
    career_stage: user.career_stage,
    training_level: inferTrainingLevelLabel(user),
    specialty,
    program_length_years: inferProgramLengthYears(specialty, onboarding.program_slug ?? program?.slug),
    institution: user.institution ?? program?.institution_name ?? null,
    practice_setting: user.practice_setting ?? program?.default_practice_setting ?? null,
    primary_career_track: user.primary_career_track ?? null,
    mak_stage: normalizeCareerStage(user.career_stage),
    content_pack: contract?.content_pack ?? "default",
    developmental_priorities: pressure?.emphasis ?? careerLevelAspirationPrompt(user.career_stage),
    invisible_work_lens: invisibleWorkExamples(specialty),
  };
}

function formatStageCard(card: CareerStageCardSnapshot): string {
  const lines = [
    "Career-stage card (pathway context — interpret every task through this):",
    `- Signup: ${card.signup_type}${card.institution ? ` · ${card.institution}` : ""}`,
    `- Stage: ${card.career_stage} (${card.training_level}) · Mak stage: ${card.mak_stage} · pack: ${card.content_pack}`,
  ];
  if (card.specialty) {
    const len =
      card.program_length_years != null
        ? ` · ${card.program_length_years}-year program (interpret PGY through this length)`
        : "";
    lines.push(`- Specialty: ${card.specialty}${len}`);
  }
  if (card.practice_setting) lines.push(`- Practice setting: ${card.practice_setting}`);
  if (card.primary_career_track) lines.push(`- Primary career track: ${card.primary_career_track}`);
  lines.push(`- Developmental focus: ${card.developmental_priorities}`);
  lines.push(`- Invisible work lens: ${card.invisible_work_lens}`);
  if (card.signup_type === "institutional") {
    lines.push(
      "- Institutional mode: align with ACGME milestones, ILP/CCC language, scholarly activity, and QI — developmental, not surveillance.",
    );
  }
  return lines.join("\n");
}

function formatStagePressures(careerStage: string | null | undefined, pgyLevel: string | null | undefined): string {
  const block = stagePressureBlock(careerStage, pgyLevel);
  if (!block) return "";
  const lines = ["Stage-aware coaching lens:"];
  if (block.dashboardQuestion) lines.push(`- Dashboard north star: "${block.dashboardQuestion}"`);
  if (block.pressures) lines.push(`- Likely pressures: ${block.pressures}`);
  if (block.outputPriorities) lines.push(`- Output Center priorities: ${block.outputPriorities}`);
  return lines.join("\n");
}

function formatTrackRankings(meta: OnboardingMetadata): string {
  const ranks = meta.career_track_rankings;
  if (!ranks?.length) return "";
  const sorted = [...ranks].sort((a, b) => a.rank - b.rank);
  const top = sorted
    .slice(0, 4)
    .map((r) => {
      const load =
        r.fte != null ? ` (${r.fte} FTE)` : r.hours_per_week != null ? ` (${r.hours_per_week} h/wk)` : "";
      return `${r.rank}. ${r.track}${load}`;
    })
    .join("; ");
  return `Career track rankings (from onboarding): ${top}. Use to align evidence and coaching — not to force a single path.`;
}

function formatGrowHints(meta: OnboardingMetadata): string {
  const g = meta.grow_exploration_context;
  if (!g) return "";
  const parts: string[] = ["Active career exploration context:"];
  if (g.goal?.trim()) parts.push(`- Goal: ${g.goal.trim()}`);
  if (g.reality?.trim()) parts.push(`- Reality: ${g.reality.trim()}`);
  if (g.options?.trim()) parts.push(`- Options they named: ${g.options.trim()}`);
  if (g.way_forward?.trim()) parts.push(`- Way forward: ${g.way_forward.trim()}`);
  return parts.length > 1 ? parts.join("\n") : "";
}

/** Server-only context block for Coach Mak — compact, composable with existing layers. */
export function buildCareerPathwayArchitectureContext(input: {
  user?: Pick<
    AppUser,
    | "career_stage"
    | "pgy_level"
    | "specialty"
    | "base_specialty"
    | "subspecialty"
    | "institution"
    | "practice_setting"
    | "primary_career_track"
    | "primary_program_id"
    | "onboarding_metadata"
  > | null;
  meta?: OnboardingMetadata | null;
}): string {
  const parts: string[] = [PATHWAY_PROCESSING_DOCTRINE];

  const card = input.user ? buildCareerStageCardSnapshot(input.user, input.meta ?? undefined) : null;
  if (card) {
    parts.push(formatStageCard(card));
    parts.push(formatStagePressures(input.user?.career_stage, input.user?.pgy_level));
  }

  const meta = input.meta ?? ((input.user?.onboarding_metadata ?? {}) as OnboardingMetadata);
  const trackCtx = formatTrackRankings(meta);
  if (trackCtx) parts.push(trackCtx);
  const growCtx = formatGrowHints(meta);
  if (growCtx) parts.push(growCtx);

  parts.push(
    "Follow-up question engine: when the physician mentions call, rotation, moonlighting, committee, recruitment, didactics, mentorship, burnout, conflict, or QI — ask ONE clarifying question if local meaning is unclear, then reuse learned context.",
  );

  return parts.filter(Boolean).join("\n\n");
}

/** Match user message terms to suggested follow-up (for optional pre-LLM hinting). */
export function localVocabularyFollowUpHint(message: string): string | null {
  const lower = message.toLowerCase();
  for (const [term, question] of Object.entries(LOCAL_VOCABULARY_FOLLOW_UPS)) {
    if (lower.includes(term)) return question;
  }
  return null;
}
