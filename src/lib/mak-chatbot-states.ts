import type { AppSection } from "@/lib/mak-sections";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import {
  buildOutputDocumentGreeting,
  buildQuarterlyGoalReview,
  buildSkillTranslationGreeting,
  buildAnnualGoalResetSummary,
  careerGoalsToStructuredGoals,
  defaultSkillTranslation,
  defaultStructuredGoals,
} from "@/lib/v2/goal-framework";
import { buildGoalSettingIntro } from "@/lib/v2/goal-setting-mak-flow";
import type { CareerGoal } from "@/lib/goals";
import {
  type MakEscalation,
  type EscalationInput,
  CRISIS_RESOURCES,
  PFI_BURNOUT_THRESHOLD,
  MMBI_STRAIN_PATTERN as MMBI_STRAIN_THRESHOLD,
  CAREER_ALIGNMENT_LOW,
  STALLED_GOAL_QUARTERS,
  detectEscalation,
  detectAllEscalations,
  extractEscalationInputFromMetadata,
  ESCALATION_PROTOCOLS,
} from "@/lib/v2/escalation-protocols";
import {
  type GlobalMakState,
  globalStateSystemPrompt,
  mapEscalationToGlobalState,
  resolveGlobalMakState,
  MAK_STATE_MACHINE,
} from "@/lib/v2/mak-state-machine";

export {
  type MakEscalation,
  type EscalationInput,
  CRISIS_RESOURCES,
  PFI_BURNOUT_THRESHOLD,
  CAREER_ALIGNMENT_LOW,
  STALLED_GOAL_QUARTERS,
  detectEscalation,
  detectAllEscalations,
  extractEscalationInputFromMetadata,
  ESCALATION_PROTOCOLS,
  type GlobalMakState,
  globalStateSystemPrompt,
  mapEscalationToGlobalState,
  resolveGlobalMakState,
  MAK_STATE_MACHINE,
};

/** Legacy alias */
export const MMBI_STRAIN_THRESHOLD_LEGACY = "A few times a week";

/** Tab-level chatbot states (maps to conversation flows S-1 through O-4) */
export type MakChatState =
  | "S-Welcome"
  | "S-Burnout"
  | "S-Aspiration"
  | "O-Review"
  | "O-Gap"
  | "A-Synthesis"
  | "A-Promotion"
  | "P-GoalSet"
  | "P-GoalTrack"
  | "P-GoalModify"
  | "P-AnnualReset"
  | "P-Pivot"
  | "P-JobSearch"
  | "O-Generate"
  | "O-CvUpdate"
  | "O-CoverLetter"
  | "O-PersonalStatement";

export const DEFAULT_CHAT_STATE: Record<AppSection, MakChatState> = {
  dashboard: "S-Welcome",
  subjective: "S-Welcome",
  objective: "O-Review",
  assessment: "A-Synthesis",
  plan: "P-GoalTrack",
  output: "O-Generate",
};

export function resolveChatState(input: {
  section: AppSection;
  burnoutScore?: number | null;
  energyLevel?: number | null;
  quarterlyPulseDue?: boolean;
  annualRefreshDue?: boolean;
  goalSettingMode?: boolean;
  trackPivot?: boolean;
  jobSearchActive?: boolean;
  goalModify?: boolean;
  outputFlow?: "cv" | "cover_letter" | "personal_statement";
  globalState?: GlobalMakState | null;
}): MakChatState {
  const {
    section,
    burnoutScore,
    energyLevel,
    quarterlyPulseDue,
    annualRefreshDue,
    goalSettingMode,
    trackPivot,
    jobSearchActive,
    goalModify,
    outputFlow,
    globalState,
  } = input;

  if (globalState === "ESCALATE_WELLNESS" || globalState === "ESCALATE_CRISIS") {
    return section === "subjective" ? "S-Burnout" : DEFAULT_CHAT_STATE[section];
  }
  if (globalState === "ONBOARDGOALS" || goalSettingMode) return "P-GoalSet";
  if (globalState === "GOALMODIFY" || goalModify) return "P-GoalModify";
  if (globalState === "SKILLTRANSLATE" || trackPivot) return "P-Pivot";
  if (globalState === "JOBSEARCH" || jobSearchActive) return "P-JobSearch";

  if (section === "plan" && annualRefreshDue) return "P-AnnualReset";

  if (section === "subjective" || section === "dashboard") {
    if (burnoutScore != null && burnoutScore >= PFI_BURNOUT_THRESHOLD) return "S-Burnout";
    if (energyLevel != null && energyLevel <= 3) return "S-Burnout";
    if (annualRefreshDue) return "S-Aspiration";
    if (quarterlyPulseDue) return "S-Welcome";
    return section === "subjective" ? "S-Aspiration" : "S-Welcome";
  }
  if (section === "objective") return "O-Review";
  if (section === "assessment") return "A-Synthesis";
  if (section === "plan") return "P-GoalTrack";
  if (section === "output") {
    if (outputFlow === "cv") return "O-CvUpdate";
    if (outputFlow === "cover_letter") return "O-CoverLetter";
    if (outputFlow === "personal_statement") return "O-PersonalStatement";
    return "O-Generate";
  }
  return "O-Generate";
}

export function sectionSystemPrompt(
  section: AppSection,
  state: MakChatState,
  globalState?: GlobalMakState | null,
): string {
  const base = `You are Coach Mak — the primary interface, not a sidebar feature. Professional, strengths-first, data-informed tone. No emojis. No exclamation marks in status labels. Never provide therapy or diagnoses.`;

  const safety = `Escalation protocols (9 triggers): (1) PFI burnout ≥ threshold → wellness resources; (2) mMBI ≥ 'A few times a week' → wellness; (3) crisis language → 988 + Physician Support Line, pause all coaching; (4) career alignment <40% for 2Q → mentor; (5) goal stalled 2Q → restructure/replace/coach; (6) desire to leave medicine → structured exploration, never dissuade, wellness first if PFI elevated; (7) invisible work >20 hrs/week → workload summary + urgent Sustainability Goal; (8) minority tax (DEI >4 hrs + URiM + unreasonable >3.5) → DEI portfolio + mentor; (9) rapid metric decline >15 percentile points → follow-up + goal adjustment.`;

  const bySection: Record<AppSection, string> = {
    dashboard:
      "You are at the career snapshot hub. Summarize SOAPO bands briefly and guide the physician to the right tab.",
    subjective:
      "Gate entry: professional career perspective check-in. Ask about professional trajectory, task alignment, career direction. Use validated instruments conversationally (PFI, BITS, Career Aspirations, UWES-9).",
    objective:
      "Gate entry: present Career Data vault changes since last quarter. Flag new items and items needing confirmation.",
    assessment:
      "Gate entry: synthesize Career Health Score and Career Map in plain language. Highlight improvements, areas needing attention, and career alignment.",
    plan:
      "Gate entry: review Development, Maintenance, and Sustainability goals with milestone progress. Support goal modification (objective, milestones, scope) and replacement with SMART restructuring.",
    output:
      "Gate entry: document library and generation flows — CV update, cover letter, personal statement, advancement readiness report, career brief, workload summary.",
  };

  const byState: Partial<Record<MakChatState, string>> = {
    "S-Burnout":
      "Professional strain elevated. Normalize strain without therapeutic language. Offer wellness resources. Pause career-focused coaching until resources acknowledged.",
    "S-Aspiration":
      "Annual career direction review (S-6): reconfirm career track, 3-year objective, and professional trajectory. Ask whether objectives have changed since last annual update.",
    "A-Promotion":
      "Present advancement readiness checklist with met / in progress / not yet. Suggest timeline.",
    "P-GoalSet":
      "First goal setting: explain 3-goal framework, present AI-proposed goals with SMART milestones, support Confirm / Modify / Replace.",
    "P-GoalModify":
      "Collaborative refinement (P-6): goal itself, milestones, or scope. For Replace, accept free-text and return structured SMART version.",
    "P-GoalTrack":
      "Quarterly milestone review (P-4) per goal. Handle completed, in progress, deferred, not started. Flag stalled goals after 2 quarters.",
    "P-AnnualReset":
      "Annual review (P-5): summarize 12-month progress, Career Health Score and alignment change, propose 3 new goals.",
    "P-Pivot":
      "Skill translation pathway (P-2): transferable competencies, gaps, timeline. Recommend human mentor for major pivots.",
    "P-JobSearch":
      "Position search (P-3): configuration, match scoring, fit rationale, gap notes. Offer cover letter generation.",
    "O-CvUpdate":
      "CV update flow (O-2): present new items with placement suggestions, add/skip/edit, open editor.",
    "O-CoverLetter":
      "Cover letter (O-3): position, institution, emphasis, tone, length. Generate draft from Career Profile.",
    "O-PersonalStatement":
      "Personal statement (O-4): purpose, audience, themes, length, include Career Data examples option.",
  };

  const global = globalState ? globalStateSystemPrompt(globalState) : "";

  return [base, bySection[section], byState[state], global, safety].filter(Boolean).join("\n\n");
}

export function buildSectionGateGreeting(input: {
  section: AppSection;
  displayName?: string | null;
  analytics?: AnalyticsDashboard | null;
  state?: MakChatState;
  quarterLabel?: string;
  annualRefreshDue?: boolean;
  goals?: CareerGoal[];
}): string {
  const name = input.displayName ? `Dr. ${input.displayName}` : "there";
  const health = input.analytics?.career_health;
  const annualDue = input.annualRefreshDue ?? input.analytics?.annual_refresh?.due ?? false;
  const state =
    input.state ??
    resolveChatState({
      section: input.section,
      annualRefreshDue: annualDue,
      quarterlyPulseDue: input.analytics?.quarterly_pulse?.due ?? false,
    });

  if (input.section === "subjective" || (input.section === "dashboard" && state === "S-Welcome")) {
    if (state === "S-Burnout") {
      return `${name}, your professional sustainability indicators suggest elevated work-related strain. This section captures your professional perspective — career direction, task alignment, and work engagement.

The following brief assessment takes approximately 5 minutes. Responses are confidential and inform your Career Profile.

Which professional activities are most aligned with your career objectives? Which consume disproportionate time relative to their professional value?`;
    }
    if (annualDue && input.section === "subjective") {
      return buildCareerDirectionAnnualGreeting(name);
    }
    return `Welcome back, ${name}. This section captures your professional perspective — career direction, work engagement, and task alignment.

The following brief assessment takes approximately 5 minutes and covers professional satisfaction, task alignment, and career direction. Responses are confidential and inform your Career Profile.

How would you characterize your current professional trajectory? Has anything changed about your 3-year career objective since your last update?`;
  }

  if (input.section === "objective") {
    const pubs = health?.domains.find((d) => d.key === "research_influence")?.score;
    return `This section displays verified career data from your uploaded documents and public databases.

${pubs != null ? `Research influence is tracking at ${pubs}/100 based on available evidence.` : "Upload or reconcile your CV to populate Career Data metrics."}

Since your last update, the platform may have detected new publications, grants, or roles requiring review. Anything missing from your Career Data that we should add?`;
  }

  if (input.section === "assessment") {
    const score = health?.career_health_score;
    const top = health?.domains.slice().sort((a, b) => b.score - a.score).slice(0, 2);
    const weak = health?.domains.slice().sort((a, b) => a.score - b.score).slice(0, 2);
    return `This section synthesizes your Career Perspective and Career Data into a comprehensive Career Profile.

${score != null ? `Career Health Score: ${score}/100 — ${health?.career_health_summary ?? ""}` : "Complete onboarding to generate your Career Profile."}

${top?.length ? `Strongest areas: ${top.map((d) => `${d.label} (${d.score})`).join(", ")}.` : ""}
${weak?.length ? `Growth opportunities: ${weak.map((d) => `${d.label} (${d.score})`).join(", ")}.` : ""}

Key changes since last quarter are highlighted in your dashboard. Would you like to review any domain in detail?`;
  }

  if (input.section === "plan") {
    if (state === "P-GoalSet") return buildGoalSettingIntro();
    if (state === "P-Pivot") return buildSkillTranslationGreeting(defaultSkillTranslation());
    if (state === "P-JobSearch") {
      return `Position search is active. The platform matches open positions against your Career Profile — specialty, setting, career track, and geographic preferences.

Configure search criteria, review matches with fit scores and gap analysis, or generate position-specific cover letters.`;
    }
    if (state === "P-AnnualReset") {
      return buildAnnualPlanResetGreeting({
        goals: input.goals,
        analytics: input.analytics,
      });
    }
    const goals = defaultStructuredGoals({});
    return `${buildQuarterlyGoalReview({
      quarterLabel: input.quarterLabel ?? "this quarter",
      goals,
    })}

Which goal should we focus on first, or would you like suggested adjustments based on your Career Map?`;
  }

  if (input.section === "output") {
    if (state === "O-CvUpdate") {
      return `Updating your CV. The platform may have detected new items since your last update — publications, presentations, committee roles.

Review each item to add, skip, or edit details. After confirmation, the document opens in the editor with institutional template formatting applied where configured.`;
    }
    if (state === "O-CoverLetter") {
      return `Generating a cover letter. Provide the position title, institution, key qualifications to emphasize, tone (professional-formal or professional-conversational), and length (1 page or 1.5 pages).

The draft will emphasize strengths from your Career Profile and stated career objective.`;
    }
    if (state === "O-PersonalStatement") {
      return `Generating a personal statement. Specify purpose (promotion, job application, award nomination), target audience, key themes, length, and whether to weave in specific achievements from Career Data.`;
    }
    return buildOutputDocumentGreeting();
  }

  return `How can I help today, ${name}? Use the Career Dashboard bands — Career Perspective, Career Data, Career Profile, Career Strategy, and Career Documents — or ask me anything about your career development.`;
}

export function careerAlignmentFromHealth(health: CareerHealthView | null | undefined): number | null {
  if (!health) return null;
  const avg = health.domains.reduce((s, d) => s + d.score, 0) / Math.max(1, health.domains.length);
  return Math.round(avg);
}

export function buildCareerDirectionAnnualGreeting(displayName: string): string {
  return `${displayName}, it has been 12 months since your last career direction review (S-6).

This annual check-in reconfirms your career track, 3-year objective, and professional trajectory. The full battery includes work engagement, well-being, task burden, and unrecognized work — approximately 20 minutes total.

Let's start with career direction:

How would you characterize your current professional trajectory? Has your 3-year career objective changed since your last update?`;
}

export function buildAnnualPlanResetGreeting(input: {
  goals?: CareerGoal[];
  analytics?: AnalyticsDashboard | null;
}): string {
  const structured =
    input.goals?.length
      ? careerGoalsToStructuredGoals(input.goals)
      : defaultStructuredGoals({});
  const health = input.analytics?.career_health;
  const currentScore = health?.career_health_score ?? 0;
  const startScore = input.analytics?.previous_career_health_score ?? currentScore;
  const alignmentEnd = careerAlignmentFromHealth(health) ?? 0;
  const alignmentStart = input.analytics?.metric_history?.alignment?.[0] ?? alignmentEnd;

  return buildAnnualGoalResetSummary({
    goals: structured,
    careerHealthStart: startScore,
    careerHealthEnd: currentScore,
    alignmentStart,
    alignmentEnd,
  });
}

/** @deprecated Use detectEscalation from escalation-protocols */
export function detectEscalationFromMessage(
  message: string,
  burnoutScore?: number | null,
): MakEscalation | null {
  return detectEscalation({ message, burnoutScore });
}

export { MMBI_STRAIN_THRESHOLD };
