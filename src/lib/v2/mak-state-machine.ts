import type { AppSection } from "@/lib/mak-sections";

/** Part 9: Complete chatbot state machine — all states */

export type GlobalMakState =
  | "ONBOARDWELCOME"
  | "ONBOARDPROFILE"
  | "ONBOARDUPLOAD"
  | "ONBOARDRECONCILE"
  | "ONBOARDQUESTIONNAIRE"
  | "ONBOARDDASHBOARD"
  | "ONBOARDGOALS"
  | "ACTIVE_DASHBOARD"
  | "ACTIVESUBJECTIVE"
  | "ACTIVEOBJECTIVE"
  | "ACTIVEASSESSMENT"
  | "ACTIVEPLAN"
  | "ACTIVEOUTPUT"
  | "GOALMODIFY"
  | "SKILLTRANSLATE"
  | "JOBSEARCH"
  | "ESCALATE_WELLNESS"
  | "ESCALATE_CRISIS"
  | "ESCALATE_MENTOR";

export type MakStateDefinition = {
  state: GlobalMakState;
  tab: AppSection | "Global";
  entryCondition: string;
  chatbotBehavior: string;
  exitCondition: string;
  nextState: GlobalMakState | "Previous state";
};

export const MAK_STATE_MACHINE: MakStateDefinition[] = [
  {
    state: "ONBOARDWELCOME",
    tab: "Global",
    entryCondition: "First login",
    chatbotBehavior: "Display welcome, orientation, SOAPO text summary",
    exitCondition: "Physician clicks Begin Setup",
    nextState: "ONBOARDPROFILE",
  },
  {
    state: "ONBOARDPROFILE",
    tab: "Global",
    entryCondition: "After welcome",
    chatbotBehavior: "Sequential profile configuration (5 screens)",
    exitCondition: "All 5 screens completed",
    nextState: "ONBOARDUPLOAD",
  },
  {
    state: "ONBOARDUPLOAD",
    tab: "objective",
    entryCondition: "After profile",
    chatbotBehavior: "Document upload with drag-and-drop + processing status",
    exitCondition: "Upload complete + processing finished",
    nextState: "ONBOARDRECONCILE",
  },
  {
    state: "ONBOARDRECONCILE",
    tab: "objective",
    entryCondition: "After processing",
    chatbotBehavior: "Present items needing confirmation from API enrichment",
    exitCondition: "All items confirmed or rejected",
    nextState: "ONBOARDQUESTIONNAIRE",
  },
  {
    state: "ONBOARDQUESTIONNAIRE",
    tab: "subjective",
    entryCondition: "After reconciliation",
    chatbotBehavior:
      "Conversational questionnaire: PFI → BITS → Invisible Work → Career Direction → UWES-9",
    exitCondition: "All modules completed",
    nextState: "ONBOARDDASHBOARD",
  },
  {
    state: "ONBOARDDASHBOARD",
    tab: "dashboard",
    entryCondition: "After questionnaire",
    chatbotBehavior: "Guided overlay highlighting each SOAPO band",
    exitCondition: "Physician clicks Got it",
    nextState: "ONBOARDGOALS",
  },
  {
    state: "ONBOARDGOALS",
    tab: "plan",
    entryCondition: "After dashboard reveal",
    chatbotBehavior: "Present 3 AI-proposed goals with SMART milestones",
    exitCondition: "All 3 goals confirmed, modified, or replaced",
    nextState: "ACTIVE_DASHBOARD",
  },
  {
    state: "ACTIVE_DASHBOARD",
    tab: "dashboard",
    entryCondition: "After onboarding complete OR any return visit",
    chatbotBehavior:
      "Display SOAPO dashboard snapshot. Highlight changes since last visit.",
    exitCondition: "Physician clicks any tab",
    nextState: "ACTIVESUBJECTIVE",
  },
  {
    state: "ACTIVESUBJECTIVE",
    tab: "subjective",
    entryCondition: "Physician enters Career Perspective tab",
    chatbotBehavior:
      "If quarterly pulse due: initiate S-8. If annual refresh due: full battery. Otherwise display current data with update option.",
    exitCondition: "Questionnaire completed OR physician exits tab",
    nextState: "ACTIVE_DASHBOARD",
  },
  {
    state: "ACTIVEOBJECTIVE",
    tab: "objective",
    entryCondition: "Physician enters Career Data tab",
    chatbotBehavior:
      "If new items detected: present O-2 quarterly update. Otherwise display current data with manual add option.",
    exitCondition: "Review completed OR physician exits tab",
    nextState: "ACTIVE_DASHBOARD",
  },
  {
    state: "ACTIVEASSESSMENT",
    tab: "assessment",
    entryCondition: "Physician enters Career Profile tab",
    chatbotBehavior:
      "Display current Career Profile with changes highlighted. If quarterly update available: present A-2.",
    exitCondition: "Physician exits tab",
    nextState: "ACTIVE_DASHBOARD",
  },
  {
    state: "ACTIVEPLAN",
    tab: "plan",
    entryCondition: "Physician enters Career Strategy tab",
    chatbotBehavior:
      "If quarterly review due: initiate P-4 goal tracking. If annual reset due: initiate P-5. Otherwise display goals with progress.",
    exitCondition: "Goal review completed OR physician exits tab",
    nextState: "ACTIVE_DASHBOARD",
  },
  {
    state: "ACTIVEOUTPUT",
    tab: "output",
    entryCondition: "Physician enters Career Documents tab",
    chatbotBehavior: "Present document library with available actions. Respond to free-text requests.",
    exitCondition: "Document generated/updated OR physician exits tab",
    nextState: "ACTIVE_DASHBOARD",
  },
  {
    state: "GOALMODIFY",
    tab: "plan",
    entryCondition: "Physician clicks Modify on any goal",
    chatbotBehavior: "Structured refinement conversation (P-6)",
    exitCondition: "Goal confirmed",
    nextState: "ACTIVEPLAN",
  },
  {
    state: "SKILLTRANSLATE",
    tab: "plan",
    entryCondition: "Physician explores track pivot",
    chatbotBehavior: "Present P-2 skill translation pathway",
    exitCondition: "Physician confirms or exits",
    nextState: "ACTIVEPLAN",
  },
  {
    state: "JOBSEARCH",
    tab: "plan",
    entryCondition: "Physician activates position search",
    chatbotBehavior: "Present P-3 job search module",
    exitCondition: "Physician saves positions or exits",
    nextState: "ACTIVEPLAN",
  },
  {
    state: "ESCALATE_WELLNESS",
    tab: "Global",
    entryCondition:
      "PFI threshold OR mMBI threshold OR rapid decline in sustainability metrics",
    chatbotBehavior:
      "Display wellness resources. Pause career-focused conversation until acknowledged.",
    exitCondition: "Physician acknowledges resources",
    nextState: "Previous state",
  },
  {
    state: "ESCALATE_CRISIS",
    tab: "Global",
    entryCondition: "Suicidal ideation language detected",
    chatbotBehavior:
      "Immediate crisis resource display. All other functions paused. Do not counsel.",
    exitCondition: "Physician acknowledges",
    nextState: "Previous state",
  },
  {
    state: "ESCALATE_MENTOR",
    tab: "Global",
    entryCondition:
      "Career alignment <40% for 2Q OR goal stalled 2Q OR desire to leave medicine (without crisis)",
    chatbotBehavior: "Offer human mentor/coach connection or structured career exploration",
    exitCondition: "Physician accepts or declines",
    nextState: "Previous state",
  },
];

export type EscalationGlobalState =
  | "ESCALATE_WELLNESS"
  | "ESCALATE_CRISIS"
  | "ESCALATE_MENTOR";

export type ResolveGlobalStateInput = {
  tier1Complete?: boolean;
  tier2Complete?: boolean;
  tier3Complete?: boolean;
  goalsConfirmed?: boolean;
  section?: AppSection;
  goalModify?: boolean;
  trackPivot?: boolean;
  jobSearchActive?: boolean;
  escalationState?: EscalationGlobalState | null;
  quarterlyPulseDue?: boolean;
  annualResetDue?: boolean;
  quarterlyReviewDue?: boolean;
  newObjectiveItems?: boolean;
};

export function resolveGlobalMakState(input: ResolveGlobalStateInput): GlobalMakState {
  if (input.escalationState) return input.escalationState;

  if (!input.tier1Complete) {
    return input.section === "dashboard" ? "ONBOARDWELCOME" : "ONBOARDPROFILE";
  }
  if (!input.tier2Complete) {
    if (input.section === "objective") return "ONBOARDUPLOAD";
    return "ONBOARDPROFILE";
  }
  if (!input.tier3Complete) {
    return "ONBOARDQUESTIONNAIRE";
  }
  if (!input.goalsConfirmed) {
    if (input.section === "plan") return "ONBOARDGOALS";
    return "ONBOARDDASHBOARD";
  }

  if (input.quarterlyReviewDue && input.section === "subjective") {
    return "ACTIVESUBJECTIVE";
  }
  if (input.newObjectiveItems && input.section === "objective") {
    return "ACTIVEOBJECTIVE";
  }

  if (input.goalModify) return "GOALMODIFY";
  if (input.trackPivot) return "SKILLTRANSLATE";
  if (input.jobSearchActive) return "JOBSEARCH";

  switch (input.section) {
    case "subjective":
      return "ACTIVESUBJECTIVE";
    case "objective":
      return "ACTIVEOBJECTIVE";
    case "assessment":
      return "ACTIVEASSESSMENT";
    case "plan":
      return "ACTIVEPLAN";
    case "output":
      return "ACTIVEOUTPUT";
    default:
      return "ACTIVE_DASHBOARD";
  }
}

export function globalStateSystemPrompt(state: GlobalMakState): string {
  const row = MAK_STATE_MACHINE.find((r) => r.state === state);
  if (!row) return "";
  return `Global state: ${state}. Behavior: ${row.chatbotBehavior}. Exit when: ${row.exitCondition}.`;
}

export function mapEscalationToGlobalState(
  trigger: string,
): EscalationGlobalState | null {
  if (trigger === "crisis_language") return "ESCALATE_CRISIS";
  if (
    trigger === "pfi_burnout_threshold" ||
    trigger === "mmbi_strain_screen" ||
    trigger === "rapid_metric_decline"
  ) {
    return "ESCALATE_WELLNESS";
  }
  if (
    trigger === "career_alignment_low" ||
    trigger === "goal_stalled" ||
    trigger === "career_exit"
  ) {
    return "ESCALATE_MENTOR";
  }
  if (trigger === "invisible_work_critical" || trigger === "minority_tax_elevated") {
    return "ESCALATE_MENTOR";
  }
  return null;
}
