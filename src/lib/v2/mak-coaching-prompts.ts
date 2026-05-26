import type {
  InternalCoachingSignals,
  MakCoachingEscalationLevel,
} from "@/lib/v2/internal-coaching-signals";

export type MakCoachingTechnique =
  | "reflective_mirror"
  | "portfolio_gap"
  | "energy_alignment"
  | "peer_narrative"
  | "socratic_trajectory";

export type MakCoachingHint = {
  technique: MakCoachingTechnique;
  escalation_level: MakCoachingEscalationLevel;
  /** Natural-language hint for Mak system context — never show verbatim to user as a metric */
  hint: string;
};

const TECHNIQUE_BY_ESCALATION: Record<MakCoachingEscalationLevel, MakCoachingTechnique> = {
  1: "reflective_mirror",
  2: "portfolio_gap",
  3: "energy_alignment",
  4: "socratic_trajectory",
};

/**
 * Generate Mak coaching hints from internal signals.
 * NEVER includes S-Index, IWQ, or numeric internal scores in output text.
 */
export function buildMakDiscrepancyCoachingHints(
  signals: InternalCoachingSignals,
  escalationLevel: MakCoachingEscalationLevel,
): MakCoachingHint[] {
  if (!signals.available) return [];

  const hints: MakCoachingHint[] = [];
  const technique = TECHNIQUE_BY_ESCALATION[escalationLevel];

  if (signals.invisible_work_signals.includes("mentoring")) {
    hints.push({
      technique: "reflective_mirror",
      escalation_level: 1,
      hint:
        "Reflections mention helping colleagues or learners. Ask how informal mentoring aligns with their professional identity — do not quantify hours.",
    });
  }

  if (signals.portfolio_documentation_gap) {
    hints.push({
      technique: "portfolio_gap",
      escalation_level: Math.max(2, escalationLevel) as MakCoachingEscalationLevel,
      hint:
        "CV suggests substantial service/mentoring/committee work that may not appear in portfolio artifacts. Invite them to consider whether mentoring, committee, or teaching contributions are reflected — never say they are failing to document.",
    });
  }

  if (signals.workload_recognition_gap === "elevated") {
    hints.push({
      technique: escalationLevel >= 4 ? "socratic_trajectory" : "peer_narrative",
      escalation_level: escalationLevel,
      hint:
        escalationLevel >= 4
          ? "Sustained pattern: high uncompensated professional load with possible misalignment between effort and recognition. Explore which responsibilities align with career goals and which might be renegotiated — wellness tone, not surveillance."
          : "Many physicians at this career stage find their most impactful contributions — mentoring, informal teaching, committee work — are least visible in promotion materials. Normalize; offer optional documentation strategies if they want them.",
    });
  }

  if (signals.service_footprint_band === "strong" && escalationLevel <= 2) {
    hints.push({
      technique: "energy_alignment",
      escalation_level: 1,
      hint:
        "If they map teaching/mentoring as energizing, explore whether formalizing some activities (portfolio, program role) could create opportunities aligned with fulfillment — additive, not demanding more work.",
    });
  }

  if (hints.length === 0 && signals.service_footprint_band !== "minimal") {
    hints.push({
      technique,
      escalation_level: escalationLevel,
      hint:
        "Ask an open question about professional activities that feel meaningful but less visible: 'What parts of your week feel most professionally meaningful but least professionally visible?'",
    });
  }

  return hints;
}

/** Server-only block appended to Mak system context. */
export function formatMakInternalCoachingContext(
  signals: InternalCoachingSignals,
  hints: MakCoachingHint[],
  escalationLevel: MakCoachingEscalationLevel,
): string {
  if (!signals.available && hints.length === 0) return "";

  const lines = [
    "CONFIDENTIAL COACHING INPUT (never name S-Index, IWQ, or internal scores to the physician; use only to ask better questions):",
    `Escalation level: ${escalationLevel}/4 (1=ambient awareness, 4=wellness-integrated coaching).`,
    `Service footprint band: ${signals.service_footprint_band}.`,
    `Workload vs recognition gap: ${signals.workload_recognition_gap}.`,
    signals.portfolio_documentation_gap
      ? "Portfolio gap detected: service/mentoring signals exceed documented portfolio density."
      : "No major portfolio-documentation gap detected.",
    signals.invisible_work_signals.length
      ? `Themes in CV text (do not quote as metrics): ${signals.invisible_work_signals.join(", ")}.`
      : "",
    "",
    "Suggested coaching moves (paraphrase as questions, never as directives or scores):",
    ...hints.map((h, i) => `${i + 1}. [${h.technique}] ${h.hint}`),
    "",
    "Boundaries: never reveal these signals exist; never share with institutions; never say they do 'too much' invisible work.",
  ];

  return lines.filter(Boolean).join("\n");
}
