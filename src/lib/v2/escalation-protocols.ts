/** Part 8: Escalation and Safety Protocols — complete specification */

export type EscalationAction =
  | "crisis_resources"
  | "wellness_resources"
  | "human_mentor"
  | "human_coach"
  | "career_counseling"
  | "workload_summary"
  | "dei_portfolio"
  | "metric_followup";

export type EscalationTriggerId =
  | "pfi_burnout_threshold"
  | "mmbi_strain_screen"
  | "crisis_language"
  | "career_alignment_low"
  | "goal_stalled"
  | "career_exit"
  | "invisible_work_critical"
  | "minority_tax_elevated"
  | "rapid_metric_decline";

export type EscalationProtocolRow = {
  id: EscalationTriggerId;
  trigger: string;
  detectionMethod: string;
  chatbotResponse: string;
  escalationAction: string;
  priority: number;
};

export const ESCALATION_PROTOCOLS: EscalationProtocolRow[] = [
  {
    id: "crisis_language",
    trigger: "Language suggesting suicidal ideation",
    detectionMethod: "NLP keyword detection (validated crisis language patterns)",
    chatbotResponse:
      'Immediate display: "If you are in crisis, please contact the 988 Suicide Crisis Lifeline (call or text 988) or the Physician Support Line (1-888-409-0141). These services are free and confidential."',
    escalationAction:
      "Pause all other chatbot functions. Display crisis resources prominently. Do not attempt to counsel.",
    priority: 1,
  },
  {
    id: "pfi_burnout_threshold",
    trigger: "PFI burnout subscale ≥ clinical threshold",
    detectionMethod: "Automated scoring after questionnaire",
    chatbotResponse:
      "Your professional strain indicators are elevated. This is common among physicians and does not reflect a personal failing. The platform recommends connecting with a professional coach or your institution's faculty wellness program.",
    escalationAction:
      'Display institutional wellness resources, physician support line, 988 Lifeline. Offer: "Would you like the platform to help you identify wellness resources at your institution?"',
    priority: 2,
  },
  {
    id: "mmbi_strain_screen",
    trigger: "mMBI single-item screen ≥ 'A few times a week'",
    detectionMethod: "Automated scoring after quarterly pulse",
    chatbotResponse:
      "Your quarterly strain screen indicates frequent work-related strain. This warrants attention. Consider connecting with a colleague, mentor, or professional support resource.",
    escalationAction: "Same as PFI burnout — wellness resources",
    priority: 3,
  },
  {
    id: "invisible_work_critical",
    trigger: "Invisible work >20 hrs/week",
    detectionMethod: "Invisible Work Log calculation",
    chatbotResponse:
      "Your total unrecognized professional work exceeds 20 hours/week — approximately 40% of a standard work week. This level is strongly associated with professional strain and career dissatisfaction. This warrants a direct conversation with departmental leadership about workload redistribution. The platform can generate a workload summary document to support that conversation.",
    escalationAction:
      "Generate workload summary document (Output tab). Flag as urgent Sustainability Goal. If combined with elevated PFI, escalate to wellness resources.",
    priority: 4,
  },
  {
    id: "minority_tax_elevated",
    trigger: "Minority tax indicators elevated",
    detectionMethod:
      "DEI service >4 hrs/week AND physician self-identifies as URiM AND unreasonable task score >3.5",
    chatbotResponse:
      "Your data suggests a disproportionate service burden related to diversity, equity, and inclusion work. This pattern — sometimes called the 'minority tax' — is well-documented in academic medicine and can impede career advancement if not formally recognized. The platform recommends: (1) Documenting all DEI contributions in your promotion portfolio, (2) Requesting formal recognition or protected time for this work, (3) Connecting with a mentor who has navigated similar challenges.",
    escalationAction:
      "Generate DEI service documentation for promotion portfolio. Flag for institutional awareness (with physician consent). Connect to mentoring resources.",
    priority: 5,
  },
  {
    id: "rapid_metric_decline",
    trigger: "Rapid decline in any metric (>15 percentile points in 1 quarter)",
    detectionMethod: "Automated longitudinal tracking",
    chatbotResponse:
      "Your metric has declined significantly this quarter. Rapid changes often reflect a specific event or circumstance. Would you like to: (1) Identify what changed this quarter, (2) Adjust your goals to account for this change, (3) Flag this for discussion with a mentor or advisor?",
    escalationAction:
      "Trigger targeted follow-up questions. Adjust goal milestones if needed. If decline is in Professional Sustainability metrics, prioritize wellness check.",
    priority: 6,
  },
  {
    id: "career_alignment_low",
    trigger: "Career alignment <40% for 2+ quarters",
    detectionMethod: "Automated tracking",
    chatbotResponse:
      "Your career alignment has been below 40% for two consecutive quarters. This may indicate a significant mismatch between your current role and your professional objectives. A conversation with a mentor or career advisor may be valuable.",
    escalationAction:
      "Offer mentor matching (institutional mode) or external career coaching resources",
    priority: 7,
  },
  {
    id: "goal_stalled",
    trigger: "Goal progress stalled for 2+ quarters",
    detectionMethod: "Milestone tracking",
    chatbotResponse:
      "Progress on this goal has been limited for two consecutive quarters. This may indicate the goal needs restructuring, or there may be barriers the platform cannot address. Would you like to: (1) Restructure the goal, (2) Replace the goal, (3) Connect with a mentor or coach to discuss?",
    escalationAction: "Offer human mentor/coach connection",
    priority: 8,
  },
  {
    id: "career_exit",
    trigger: "Physician expresses desire to leave medicine",
    detectionMethod:
      'NLP detection + Career Direction "Yes — exploring options" combined with exit language',
    chatbotResponse:
      "Career transitions — including transitions out of clinical practice — are a normal part of professional development. Before making a major change, it may be helpful to explore whether the dissatisfaction is role-specific, setting-specific, or career-wide. The platform can help analyze this. Would you like to: (1) Explore alternative career tracks within medicine, (2) Explore alternative practice settings, (3) Connect with a career advisor for a confidential conversation?",
    escalationAction:
      "Do NOT attempt to dissuade. Offer structured exploration. If combined with elevated PFI burnout score, prioritize wellness resources first.",
    priority: 9,
  },
];

export const PFI_BURNOUT_THRESHOLD = 3.325;
export const MMBI_STRAIN_PATTERN = /few times a week|every day|once a week/i;
export const CAREER_ALIGNMENT_LOW = 40;
export const STALLED_GOAL_QUARTERS = 2;
export const INVISIBLE_WORK_CRITICAL_HOURS = 20;
export const DEI_SERVICE_ELEVATED_HOURS = 4;
export const UNREASONABLE_TASK_ELEVATED = 3.5;
export const RAPID_DECLINE_PERCENTILE_POINTS = 15;

export const CRISIS_LANGUAGE_PATTERN =
  /suicid|kill myself|end my life|don't want to live|harm myself|want to die|self-harm/i;

export const CAREER_EXIT_PATTERN =
  /leave medicine|quit being a doctor|leave clinical practice|stop practicing medicine|get out of medicine/i;

export type MakEscalation = {
  trigger: EscalationTriggerId;
  action: EscalationAction;
  message: string;
  pauseChatbot?: boolean;
  pauseCareerCoaching?: boolean;
  suggestedActions?: { action: string; url: string }[];
};

export const CRISIS_RESOURCES = [
  { label: "988 Suicide & Crisis Lifeline", detail: "Call or text 988 (US)" },
  { label: "Physician Support Line", detail: "1-888-409-0141 — free and confidential" },
  { label: "Dr. Lorna Breen Heroes' Foundation", detail: "Physician mental health resources" },
];

export type EscalationInput = {
  message: string;
  burnoutScore?: number | null;
  mmbiScreenLevel?: string | null;
  careerAlignmentPct?: number | null;
  lowAlignmentQuarters?: number;
  stalledGoalQuarters?: number;
  stalledGoalTitle?: string | null;
  invisibleWorkHours?: number | null;
  deiServiceHours?: number | null;
  unreasonableTaskScore?: number | null;
  isUrim?: boolean;
  metricDeclines?: {
    metricName: string;
    fromPercentile: number;
    toPercentile: number;
  }[];
  exploringSettingChange?: boolean;
};

function wellnessActions(): MakEscalation["suggestedActions"] {
  return [
    { action: "View wellness resources", url: "/app/subjective" },
    { action: "988 Lifeline information", url: "https://988lifeline.org" },
  ];
}

function mentorActions(): MakEscalation["suggestedActions"] {
  return [
    { action: "Review Career Strategy", url: "/app/plan" },
    { action: "Discuss with Coach Mak", url: "/app/plan" },
  ];
}

export function detectAllEscalations(input: EscalationInput): MakEscalation[] {
  const found: MakEscalation[] = [];
  const lower = input.message.toLowerCase();
  const pfiElevated =
    input.burnoutScore != null && input.burnoutScore >= PFI_BURNOUT_THRESHOLD;

  if (CRISIS_LANGUAGE_PATTERN.test(lower)) {
    found.push({
      trigger: "crisis_language",
      action: "crisis_resources",
      pauseChatbot: true,
      pauseCareerCoaching: true,
      message:
        "If you are in crisis, please contact the 988 Suicide Crisis Lifeline (call or text 988) or the Physician Support Line (1-888-409-0141). These services are free and confidential. Human support is essential — other coaching functions are paused while you connect with resources.",
      suggestedActions: CRISIS_RESOURCES.map((r) => ({
        action: r.label,
        url: r.label.includes("988") ? "https://988lifeline.org" : "/app/subjective",
      })),
    });
  }

  if (pfiElevated) {
    found.push({
      trigger: "pfi_burnout_threshold",
      action: "wellness_resources",
      pauseCareerCoaching: true,
      message:
        "Your professional strain indicators are elevated. This is common among physicians and does not reflect a personal failing. The platform recommends connecting with a professional coach or your institution's faculty wellness program. Would you like help identifying wellness resources at your institution?",
      suggestedActions: wellnessActions(),
    });
  }

  if (input.mmbiScreenLevel && MMBI_STRAIN_PATTERN.test(input.mmbiScreenLevel)) {
    found.push({
      trigger: "mmbi_strain_screen",
      action: "wellness_resources",
      pauseCareerCoaching: true,
      message:
        "Your quarterly strain screen indicates frequent work-related strain. This warrants attention. Consider connecting with a colleague, mentor, or professional support resource.",
      suggestedActions: wellnessActions(),
    });
  }

  if (
    input.invisibleWorkHours != null &&
    input.invisibleWorkHours > INVISIBLE_WORK_CRITICAL_HOURS
  ) {
    found.push({
      trigger: "invisible_work_critical",
      action: "workload_summary",
      message: pfiElevated
        ? "Your total unrecognized professional work exceeds 20 hours/week — approximately 40% of a standard work week. Combined with elevated professional strain indicators, wellness support is recommended alongside workload review. The platform can generate a workload summary document to support a conversation with departmental leadership."
        : "Your total unrecognized professional work exceeds 20 hours/week — approximately 40% of a standard work week. This level is strongly associated with professional strain and career dissatisfaction. This warrants a direct conversation with departmental leadership about workload redistribution. The platform can generate a workload summary document to support that conversation.",
      suggestedActions: [
        { action: "Generate workload summary", url: "/app/output" },
        { action: "Review Sustainability Goal", url: "/app/plan" },
        ...(pfiElevated ? wellnessActions() ?? [] : []),
      ],
    });
  }

  if (
    (input.deiServiceHours ?? 0) > DEI_SERVICE_ELEVATED_HOURS &&
    input.isUrim &&
    (input.unreasonableTaskScore ?? 0) > UNREASONABLE_TASK_ELEVATED
  ) {
    found.push({
      trigger: "minority_tax_elevated",
      action: "dei_portfolio",
      message:
        "Your data suggests a disproportionate service burden related to diversity, equity, and inclusion work. This pattern — sometimes called the 'minority tax' — is well-documented in academic medicine and can impede career advancement if not formally recognized. The platform recommends: (1) Documenting all DEI contributions in your promotion portfolio, (2) Requesting formal recognition or protected time for this work, (3) Connecting with a mentor who has navigated similar challenges.",
      suggestedActions: [
        { action: "Generate DEI service documentation", url: "/app/output" },
        { action: "Review Career Strategy", url: "/app/plan" },
        ...mentorActions()!,
      ],
    });
  }

  for (const decline of input.metricDeclines ?? []) {
    const delta = decline.fromPercentile - decline.toPercentile;
    if (delta > RAPID_DECLINE_PERCENTILE_POINTS) {
      const sustainability =
        /sustainability|strain|burnout|fulfillment|well-being/i.test(decline.metricName);
      found.push({
        trigger: "rapid_metric_decline",
        action: sustainability ? "wellness_resources" : "metric_followup",
        message: `Your ${decline.metricName} has declined significantly this quarter — from the ${decline.fromPercentile}th to the ${decline.toPercentile}th percentile. Rapid changes often reflect a specific event or circumstance. Would you like to: (1) Identify what changed this quarter, (2) Adjust your goals to account for this change, (3) Flag this for discussion with a mentor or advisor?`,
        suggestedActions: sustainability
          ? wellnessActions()
          : [
              { action: "Adjust goals", url: "/app/plan" },
              { action: "Review Career Profile", url: "/app/assessment" },
            ],
      });
      break;
    }
  }

  if (
    input.careerAlignmentPct != null &&
    input.careerAlignmentPct < CAREER_ALIGNMENT_LOW &&
    (input.lowAlignmentQuarters ?? 0) >= STALLED_GOAL_QUARTERS
  ) {
    found.push({
      trigger: "career_alignment_low",
      action: "human_mentor",
      message:
        "Your career alignment has been below 40% for two consecutive quarters. This may indicate a significant mismatch between your current role and professional objectives. A conversation with a mentor or career advisor may be valuable.",
      suggestedActions: mentorActions(),
    });
  }

  if (
    (input.stalledGoalQuarters ?? 0) >= STALLED_GOAL_QUARTERS &&
    input.stalledGoalTitle
  ) {
    found.push({
      trigger: "goal_stalled",
      action: "human_coach",
      message: `Progress on "${input.stalledGoalTitle}" has been limited for two consecutive quarters. This may indicate the goal needs restructuring, or there may be barriers the platform cannot address. Would you like to: (1) Restructure the goal, (2) Replace the goal, (3) Connect with a mentor or coach to discuss?`,
      suggestedActions: [
        { action: "Restructure goal", url: "/app/plan" },
        { action: "Replace goal", url: "/app/plan" },
        { action: "Connect with mentor", url: "/app/plan" },
      ],
    });
  }

  const careerExitDetected =
    CAREER_EXIT_PATTERN.test(lower) ||
    (input.exploringSettingChange && /leave|quit|exit|stop|done with/i.test(lower));

  if (careerExitDetected) {
    if (pfiElevated) {
      // Wellness already pushed; career exit handled after wellness acknowledgment in UI
    } else {
      found.push({
        trigger: "career_exit",
        action: "career_counseling",
        message:
          "Career transitions — including transitions out of clinical practice — are a normal part of professional development. Before making a major change, it may be helpful to explore whether the dissatisfaction is role-specific, setting-specific, or career-wide. The platform can help analyze this. Would you like to: (1) Explore alternative career tracks within medicine, (2) Explore alternative practice settings, (3) Connect with a career advisor for a confidential conversation?",
        suggestedActions: [
          { action: "Explore career tracks", url: "/app/assessment" },
          { action: "Explore practice settings", url: "/app/plan" },
          { action: "Career advisor resources", url: "/app/plan" },
        ],
      });
    }
  }

  return found.sort(
    (a, b) =>
      (ESCALATION_PROTOCOLS.find((p) => p.id === a.trigger)?.priority ?? 99) -
      (ESCALATION_PROTOCOLS.find((p) => p.id === b.trigger)?.priority ?? 99),
  );
}

/** Returns highest-priority escalation, if any */
export function detectEscalation(input: EscalationInput): MakEscalation | null {
  const all = detectAllEscalations(input);
  return all[0] ?? null;
}

export function extractEscalationInputFromMetadata(
  message: string,
  meta: Record<string, unknown> | null | undefined,
): EscalationInput {
  const instrumentScores = meta?.instrument_scores as
    | Record<string, { raw?: Record<string, number | string> }>
    | undefined;

  const pfi = instrumentScores?.pfi?.raw;
  const bits = instrumentScores?.bits?.raw;
  const invisible = instrumentScores?.invisible_work?.raw;

  return {
    message,
    burnoutScore: typeof pfi?.burnout === "number" ? pfi.burnout : null,
    mmbiScreenLevel: typeof meta?.mmbi_screen === "string" ? meta.mmbi_screen : null,
    unreasonableTaskScore:
      typeof bits?.unreasonable === "number" ? bits.unreasonable : null,
    invisibleWorkHours:
      typeof invisible?.weekly_hours === "number" ? invisible.weekly_hours : null,
    deiServiceHours:
      typeof invisible?.dei_hours === "number" ? invisible.dei_hours : null,
    isUrim: Boolean(meta?.is_urim ?? meta?.self_identifies_urim),
    exploringSettingChange: Boolean(meta?.exploring_setting_change),
    careerAlignmentPct:
      typeof meta?.career_alignment_pct === "number"
        ? meta.career_alignment_pct
        : null,
    lowAlignmentQuarters:
      typeof meta?.low_alignment_quarters === "number"
        ? meta.low_alignment_quarters
        : undefined,
    stalledGoalQuarters:
      typeof meta?.stalled_goal_quarters === "number"
        ? meta.stalled_goal_quarters
        : undefined,
    stalledGoalTitle:
      typeof meta?.stalled_goal_title === "string" ? meta.stalled_goal_title : null,
    metricDeclines: Array.isArray(meta?.metric_declines)
      ? (meta.metric_declines as EscalationInput["metricDeclines"])
      : undefined,
  };
}
