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
import { resolveContentPack, normalizeCareerStage } from "@/lib/v2/mak-conversation-models";
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
  | "P-BoardBuild"
  | "O-Generate"
  | "O-CvUpdate"
  | "O-CoverLetter"
  | "O-PersonalStatement"
  | "O-RotationDebrief"
  | "O-NarrativeAnchor"
  | "O-PromotionContext"
  | "O-CareerPivot"
  | "O-CareerTranslation"
  | "O-PivotQuarterly"
  | "S-IdentityNavigation"
  | "A-PromotionReadiness";

export const DEFAULT_CHAT_STATE: Record<AppSection, MakChatState> = {
  // v3 sections
  dashboard: "S-Welcome",
  lattice:   "O-Review",
  wellbeing: "S-Welcome",
  goals:     "P-GoalTrack",
  output:    "O-Generate",
  training:  "S-Welcome",
  profile:   "S-Welcome",
  // SOAP aliases
  subjective: "S-Welcome",
  objective:  "O-Review",
  assessment: "A-Synthesis",
  plan:       "P-GoalTrack",
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
  flowIntent?: string | null;
  careerStage?: string | null;
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
    flowIntent,
    careerStage,
  } = input;

  if (globalState === "ESCALATE_WELLNESS" || globalState === "ESCALATE_CRISIS") {
    return section === "subjective" ? "S-Burnout" : DEFAULT_CHAT_STATE[section];
  }
  if (globalState === "ONBOARDGOALS" || goalSettingMode) return "P-GoalSet";
  if (flowIntent === "board_awareness" || flowIntent === "board_building") return "P-BoardBuild";
  if (flowIntent === "grow_exploration") return "S-Aspiration";
  if (globalState === "GOALMODIFY" || goalModify) return "P-GoalModify";
  if (globalState === "SKILLTRANSLATE" || trackPivot) return "P-Pivot";
  if (globalState === "JOBSEARCH" || jobSearchActive) return "P-JobSearch";

  if (section === "plan" && annualRefreshDue) return "P-AnnualReset";

  if (section === "subjective" || section === "dashboard") {
    if (section === "subjective" && flowIntent === "identity_navigation") {
      return "S-IdentityNavigation";
    }
    if (burnoutScore != null && burnoutScore >= PFI_BURNOUT_THRESHOLD) return "S-Burnout";
    if (energyLevel != null && energyLevel <= 3) return "S-Burnout";
    if (annualRefreshDue) return "S-Aspiration";
    if (quarterlyPulseDue) return "S-Welcome";
    return section === "subjective" ? "S-Aspiration" : "S-Welcome";
  }
  if (section === "objective") {
    if (flowIntent === "rotation_debrief") return "O-RotationDebrief";
    if (flowIntent === "narrative_anchor") return "O-NarrativeAnchor";
    if (flowIntent === "promotion_context") return "O-PromotionContext";
    if (flowIntent === "career_pivot_onboarding") return "O-CareerPivot";
    if (flowIntent === "career_translation") return "O-CareerTranslation";
    if (flowIntent === "pivot_quarterly") return "O-PivotQuarterly";
    return "O-Review";
  }
  if (section === "assessment") {
    if (flowIntent === "promotion_readiness") return "A-PromotionReadiness";
    return "A-Synthesis";
  }
  if (section === "plan") return "P-GoalTrack";
  if (section === "output") {
    if (outputFlow === "cv") return "O-CvUpdate";
    if (outputFlow === "cover_letter") return "O-CoverLetter";
    if (outputFlow === "personal_statement" || flowIntent === "personal_statement_arc") {
      return "O-PersonalStatement";
    }
    if (flowIntent === "promotion_dossier") return "O-PersonalStatement";
    if (flowIntent === "pivot_narrative") return "O-CoverLetter";
    return "O-Generate";
  }
  return "O-Generate";
}

export function sectionSystemPrompt(
  section: AppSection,
  state: MakChatState,
  globalState?: GlobalMakState | null,
  careerStage?: string | null,
): string {
  const base = `You are Coach Mak — the primary interface, not a sidebar feature. Professional, strengths-first, data-informed tone. No emojis. No exclamation marks in status labels. Never provide therapy or diagnoses. You are one coach across every tab and flow; different screens change your hat, not your identity.`;

  const pack = resolveContentPack(careerStage);
  const stage = normalizeCareerStage(careerStage);
  const stageNote =
    pack === "trainee"
      ? "Trainee mode: prioritize narrative evidence, rotation meaning, application/ILP readiness over promotion metrics."
      : pack === "early_attending"
        ? "Early attending mode: emphasize impact evidence, promotion criteria, and dossier readiness."
        : pack === "non_traditional"
          ? "Non-traditional pivot mode: translate clinical experience into outsider language; intentional transition framing; resume/portfolio outputs not academic CV."
          : "";

  const safety = `Escalation protocols (9 triggers): (1) Burnout signal ≥ 3 (Single-Item Burnout) → wellness resources; (2) mMBI ≥ 'A few times a week' → wellness; (3) crisis language → 988 + Physician Support Line, pause all coaching; (4) career alignment <40% for 2Q → mentor; (5) goal stalled 2Q → restructure/replace/coach; (6) desire to leave medicine → structured exploration, never dissuade, wellness resources first if burnout elevated; (7) invisible work >20 hrs/week → workload summary + urgent Sustainability Goal; (8) minority tax (DEI >4 hrs + URiM + unreasonable task load) → DEI portfolio + mentor; (9) rapid metric decline >15 percentile points → follow-up + goal adjustment.`;

  const bySection: Record<AppSection, string> = {
    // v3 sections
    dashboard:
      pack === "trainee"
        ? "Career snapshot hub for a trainee. Guide toward rotation debriefs, narrative anchor, portfolio capture, and application documents."
        : "You are at the career snapshot hub. Summarize the lattice bands briefly and guide the physician to the right section.",
    lattice:
      pack === "trainee"
        ? "Career Lattice for a trainee. Flag portfolio evidence, rotation debriefs, clinical skills evaluations, and items for ILP or applications."
        : "Career Lattice view. Present bank items, flag new captures needing confirmation, highlight density patterns.",
    wellbeing:
      "Well-being section. Support check-in instruments (pulse, FCWI, quarterly snapshot) and surface Mak observations. Follow distress-detection rules (MDT ≥4 → resource link, no auto-report).",
    goals:
      pack === "trainee"
        ? "Career strategy for training: SMART goals aligned with ILP, scholarly plans, and application timelines."
        : "Goals section: review the four horizons (3mo/1yr/5yr/10yr), WOOP/SMART cards, momentum indicators. Support goal creation and review.",
    output:
      pack === "trainee"
        ? "Document generation for trainees: CV, personal statement, letter-writer packet, fellowship narrative. Use captured rotation debriefs and narrative anchor."
        : "Output Studio: document library and generation flows — CV, cover letter, personal statement, dossier, career brief.",
    training:
      "Training dashboard for institution-tied trainees. Support rotation debriefs, milestone check-ins, CCC prep. Map everything back to the lattice.",
    profile:
      "Profile section — the bank made human. Help the physician capture new items, review what's in the bank, or set up autofill from a CV.",
    // SOAP aliases (kept for backward compat)
    subjective:
      pack === "trainee"
        ? "Professional perspective check-in for a trainee."
        : "Professional career perspective check-in. Ask about trajectory, task alignment, career direction.",
    objective:
      pack === "trainee"
        ? "Career Data vault for a trainee."
        : "Career Data vault. Flag new items and items needing confirmation.",
    assessment:
      pack === "trainee"
        ? "Synthesize training progress and competency growth."
        : "Synthesize Career Map in plain language. Highlight improvements and career alignment.",
    plan:
      pack === "trainee"
        ? "Career strategy for training: SMART goals aligned with ILP."
        : "Review Development, Maintenance, and Sustainability goals with milestone progress.",
  };

  const byState: Partial<Record<MakChatState, string>> = {
    "S-Burnout":
      "Professional strain elevated. Normalize strain without therapeutic language. Offer wellness resources. Pause career-focused coaching until resources acknowledged.",
    "S-Aspiration":
      "Annual career direction review (S-6): reconfirm career track, 3-year objective, and professional trajectory. Ask whether objectives have changed since last annual update.",
    "A-Promotion":
      "Present advancement readiness checklist with met / in progress / not yet. Suggest timeline.",
    "P-GoalSet":
      "Goal setting: Development, Maintenance, Sustainability. On Confirm/Replace run Outcome → internal Obstacle → if-then plan (WOOP internal — never say WOOP). Identity through experiments first (Ibarra). Board check at each goal. Confirm, Modify, Replace, or template.",
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
    "P-BoardBuild":
      "Career Board: mentor (identity), sponsor (advocacy), coach (skill), connector (network). Self-assess gaps, then sourcing for unknown contacts. Mak interim only.",
    "O-CvUpdate":
      "CV update flow (O-2): present new items with placement suggestions, add/skip/edit, open editor.",
    "O-CoverLetter":
      "Cover letter (O-3): position, institution, emphasis, tone, length. Generate draft from Career Profile.",
    "O-PersonalStatement":
      stage === "fellow"
        ? "Fellowship personal statement (O-4): defining moment, evolution, scholarly thread, vision, program fit. Use rotation debrief entries and narrative anchor. One section at a time."
        : stage === "resident" || stage === "med_student"
          ? "Personal statement (O-4): hook, origin, journey (2–3 growth experiences), vision. Mine meaning not just facts. Use the trainee's own captured language from debriefs."
          : "Personal statement (O-4): purpose, audience, themes, length, include Career Data examples option.",
    "O-RotationDebrief":
      "Rotation debrief: 3-layer story mining — facts, reflection, connection to specialty path. One question at a time. Preserve trainee phrasing. End with a one-sentence personal statement line.",
    "O-NarrativeAnchor":
      "Narrative anchor setup: establish specialty direction, origin story, field gap, and differentiators before mining experiences.",
    "O-PromotionContext":
      "Promotion context onboarding: title, institution type, track, target rank/timeline, mentor readiness notes, professional mission.",
    "O-CareerPivot":
      "Career direction onboarding (thesis-first): solution-focused exploration of energizers and strengths, confirm one-sentence career direction, then suggest aligned paths. Hybrid model and network follow. Frame toward not away — never lead with why they want to leave medicine.",
    "O-CareerTranslation":
      "Clinical-to-outsider translation (STAR): Situation → action verb with scope/scale → result/impact. Reframe in industry/policy/media/startup language. Offer quantified resume bullets. No unexplained medical jargon.",
    "O-PivotQuarterly":
      "Path-specific quarterly mining — trials, policy engagement, media, startup workflow problems. Surface transferable skills.",
    "S-IdentityNavigation":
      "Identity navigation for career transition: leaving vs expansion, what to carry forward, mentor reactions. Sensitive — no therapy.",
    "A-PromotionReadiness":
      "Promotion readiness audit: evaluate scholarship, teaching, clinical, service, national reputation vs stated track. Flag gaps with actionable recommendations — never fabricate metrics.",
  };

  const global = globalState ? globalStateSystemPrompt(globalState) : "";

  return [base, stageNote, bySection[section], byState[state], global, safety].filter(Boolean).join("\n\n");
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
    return `This section displays verified career data from your uploaded documents and public databases.

Upload or reconcile your CV to populate Career Data metrics.

Since your last update, the platform may have detected new publications, grants, or roles requiring review. Anything missing from your Career Data that we should add?`;
  }

  if (input.section === "assessment") {
    return `This section synthesizes your Career Perspective and Career Data into reflection themes from Coach Mak conversations.

Review career patterns, touchpoint coverage, and strengths surfaced in dialogue — not composite scores.

Key themes from recent conversations are highlighted in your dashboard. Would you like to explore any area in more detail?`;
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
