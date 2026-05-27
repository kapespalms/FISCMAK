/**
 * Academic medicine role matrix — level × rank × track adaptations.
 * Used for dashboard leads, goal examples, instruments, and Mak copy.
 */
import type {
  AcademicRank,
  CareerLevel,
  PracticeSetting,
  PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import type { DashboardBandOrder } from "@/lib/v2/dashboard-architecture";

export type AcademicRoleInput = {
  setting?: PracticeSetting | null;
  level?: CareerLevel | null;
  rank?: AcademicRank | null;
  track?: PrimaryCareerTrack | string | null;
};

export type AcademicProfileAdaptation = {
  bandOrder: DashboardBandOrder;
  subjectiveLead: string;
  objectiveLead: string;
  assessmentLead: string;
  planLead: string;
  outputLead: string;
  promotionFocus: string;
  developmentExamples: string[];
  maintenanceExamples: string[];
  sustainabilityExamples: string[];
  outputTemplates: string[];
  instrumentEmphasis: string[];
  invisibleWorkNote: string;
};

const DEFAULT_BAND_ORDER: DashboardBandOrder = [
  "subjective",
  "objective",
  "assessment",
  "plan",
  "output",
];

const LATE_BAND_ORDER: DashboardBandOrder = [
  "subjective",
  "assessment",
  "plan",
  "output",
  "objective",
];

const TRAINING_BAND_ORDER: DashboardBandOrder = [
  "subjective",
  "objective",
  "assessment",
  "plan",
  "output",
];

const MS_BAND_ORDER: DashboardBandOrder = [
  "subjective",
  "objective",
  "plan",
  "assessment",
  "output",
];

type LevelBase = Omit<
  AcademicProfileAdaptation,
  "promotionFocus" | "developmentExamples" | "maintenanceExamples" | "sustainabilityExamples"
> & {
  development: string[];
  maintenance: string[];
  sustainability: string[];
  promotionByRank: Partial<Record<AcademicRank, string>>;
};

const LEVEL_BASES: Record<string, LevelBase> = {
  "Medical Student": {
    bandOrder: MS_BAND_ORDER,
    subjectiveLead: "Career Exploration",
    objectiveLead: "Experiences + Research",
    assessmentLead: "Career Explorer Map",
    planLead: "Exploration Goals",
    outputLead: "Basic CV + Personal Statement",
    outputTemplates: ["Basic CV", "Personal Statement", "Research Summary"],
    instrumentEmphasis: ["career_explorer", "pfi_brief"],
    invisibleWorkNote: "Minimal formal invisible work; establish baseline tracking.",
    development: [
      "Complete core clerkships with distinction",
      "Publish first research abstract",
      "Explore 2+ specialty pathways",
      "Build faculty mentor network",
    ],
    maintenance: [
      "Maintain Step/COMLEX readiness",
      "Sustain wellness during clinical rotations",
    ],
    sustainability: [
      "Protect study-life boundaries",
      "Reduce uncompensated volunteer overcommitment",
    ],
    promotionByRank: {},
  },
  Resident: {
    bandOrder: TRAINING_BAND_ORDER,
    subjectiveLead: "Career Identity Formation",
    objectiveLead: "Milestones + Publications",
    assessmentLead: "Career Builder Map",
    planLead: "Build Goals",
    outputLead: "CV + Application Materials",
    outputTemplates: ["Academic CV", "Personal Statement", "Letter of Intent"],
    instrumentEmphasis: ["pfi_brief", "bits", "invisible_work"],
    invisibleWorkNote:
      "Documentation overspill and uncompensated teaching typically dominate during training.",
    development: [
      "Build foundational CV",
      "Publish first manuscript",
      "Develop teaching skills",
      "Explore career tracks",
    ],
    maintenance: [
      "Maintain milestone progression",
      "Sustain clinical competency development",
    ],
    sustainability: [
      "Reduce after-hours documentation",
      "Set boundaries on uncompensated teaching",
      "Address sleep and wellness during rotations",
    ],
    promotionByRank: {},
  },
  Fellow: {
    bandOrder: TRAINING_BAND_ORDER,
    subjectiveLead: "Subspecialty Identity + Track Selection",
    objectiveLead: "Fellowship Portfolio + Grants",
    assessmentLead: "Subspecialty Readiness Map",
    planLead: "Transition Goals",
    outputLead: "CV + Biosketch + Job Materials",
    outputTemplates: ["Academic CV", "NIH Biosketch", "Cover Letter", "Research Statement"],
    instrumentEmphasis: ["pfi_brief", "bits", "invisible_work", "uwes_brief"],
    invisibleWorkNote:
      "Research coordination and manuscript mentoring often add invisible hours during fellowship.",
    development: [
      "Establish subspecialty research niche",
      "Submit K-award or career development grant",
      "Build national meeting presence",
      "Develop independent clinical expertise",
    ],
    maintenance: [
      "Maintain board certification pathway",
      "Sustain procedural competency",
    ],
    sustainability: [
      "Negotiate protected research time",
      "Reduce unfunded committee service",
      "Address fellowship workload strain",
    ],
    promotionByRank: {},
  },
  "Early Career (0–7 yr)": {
    bandOrder: DEFAULT_BAND_ORDER,
    subjectiveLead: "Career Direction",
    objectiveLead: "Publications + Grants",
    assessmentLead: "Promotion Readiness",
    planLead: "Development Goal",
    outputLead: "CV + Biosketch",
    outputTemplates: ["Academic CV", "NIH Biosketch", "Promotion Narrative"],
    instrumentEmphasis: ["pfi_full", "bits", "invisible_work", "uwes_brief"],
    invisibleWorkNote:
      "All categories emerge; documentation overspill and care coordination are often highest.",
    development: [
      "Build promotion portfolio",
      "Establish research program",
      "Develop educator identity",
      "Secure first grant",
    ],
    maintenance: [
      "Protect clinical skills during research-heavy years",
      "Maintain teaching evaluations",
    ],
    sustainability: [
      "Reduce documentation overspill",
      "Set boundaries on committee service",
      "Address minority tax if applicable",
    ],
    promotionByRank: {
      Instructor: "Promotion to Assistant Professor",
      "Assistant Professor": "Promotion to Associate Professor",
      "Associate Professor": "Promotion to Full Professor",
      "Full Professor": "National reputation building",
      Chair: "Department leadership impact",
      Emeritus: "Transition planning",
    },
  },
  "Mid-Career (8–20 yr)": {
    bandOrder: DEFAULT_BAND_ORDER,
    subjectiveLead: "Career Alignment",
    objectiveLead: "National Reputation",
    assessmentLead: "Advancement Readiness",
    planLead: "Development Goal",
    outputLead: "Promotion Dossier",
    outputTemplates: ["Promotion Dossier", "NIH Biosketch", "Leadership Statement"],
    instrumentEmphasis: ["pfi_full", "bits", "invisible_work", "uwes_full"],
    invisibleWorkNote:
      "Administrative burden and care coordination often peak; highest burnout risk period.",
    development: [
      "Build national reputation",
      "Develop leadership competency",
      "Pivot to new track",
      "Secure R01 or equivalent",
    ],
    maintenance: [
      "Sustain research productivity during administrative expansion",
      "Protect mentoring relationships",
    ],
    sustainability: [
      "Reduce administrative burden",
      "Negotiate protected time",
      "Address mid-career burnout risk",
    ],
    promotionByRank: {
      Instructor: "Promotion to Assistant Professor",
      "Assistant Professor": "Promotion to Associate Professor",
      "Associate Professor": "Promotion to Full Professor",
      "Full Professor": "Endowed chair or national leadership",
      Chair: "Institutional strategic impact",
      Emeritus: "Legacy transition",
    },
  },
  "Late Career (20+ yr)": {
    bandOrder: LATE_BAND_ORDER,
    subjectiveLead: "Professional Fulfillment",
    objectiveLead: "Career-Long Impact",
    assessmentLead: "Legacy Impact Score",
    planLead: "Sustainability Goal",
    outputLead: "Narrative CV",
    outputTemplates: ["Narrative CV", "Legacy Statement", "Succession Plan"],
    instrumentEmphasis: ["pfi_full", "uwes_brief", "invisible_work"],
    invisibleWorkNote:
      "Administrative burden and uncompensated mentoring shift toward advisory roles.",
    development: [
      "Formalize legacy contributions",
      "Develop succession planning",
      "Build mentorship portfolio",
    ],
    maintenance: ["Sustain clinical excellence", "Maintain scholarly output"],
    sustainability: [
      "Transition planning",
      "Reduce overcommitment",
      "Protect work-life integration",
    ],
    promotionByRank: {
      "Full Professor": "Emeritus or endowed leadership",
      Chair: "Succession and legacy planning",
      Emeritus: "Advisory and community impact",
    },
  },
  Retired: {
    bandOrder: LATE_BAND_ORDER,
    subjectiveLead: "Post-Career Purpose",
    objectiveLead: "Volunteer + Advisory Roles",
    assessmentLead: "Impact Retrospective",
    planLead: "Optional Engagement Goals",
    outputLead: "Legacy CV",
    outputTemplates: ["Legacy CV", "Board Biography"],
    instrumentEmphasis: ["pfi_brief"],
    invisibleWorkNote: "Volunteer teaching and community service — intentional and optional.",
    development: [
      "Formalize advisory board roles",
      "Document career legacy",
      "Mentor next generation",
    ],
    maintenance: ["Maintain professional identity", "Stay current in specialty"],
    sustainability: [
      "Set boundaries on volunteer commitments",
      "Protect retirement wellness",
    ],
    promotionByRank: {},
  },
};

const TRACK_OVERLAYS: Record<
  PrimaryCareerTrack,
  Partial<
    Pick<
      AcademicProfileAdaptation,
      | "subjectiveLead"
      | "objectiveLead"
      | "assessmentLead"
      | "planLead"
      | "outputLead"
      | "developmentExamples"
    >
  >
> = {
  Clinician: {
    objectiveLead: "Clinical volume + Quality metrics",
    assessmentLead: "Clinical Excellence Score",
    developmentExamples: [
      "Expand procedural or diagnostic expertise",
      "Build quality improvement portfolio",
      "Develop regional referral network",
    ],
  },
  Educator: {
    objectiveLead: "Teaching portfolio + Evaluations",
    assessmentLead: "Educator Identity Score",
    developmentExamples: [
      "Complete educator development program",
      "Publish educational scholarship",
      "Lead curriculum redesign",
    ],
  },
  Researcher: {
    objectiveLead: "Publications + Grant funding",
    assessmentLead: "Research Productivity Score",
    developmentExamples: [
      "Submit R01 or K-award",
      "Build collaborative research network",
      "Establish independent research line",
    ],
  },
  Leader: {
    objectiveLead: "Administrative roles + Impact",
    assessmentLead: "Leadership Readiness Score",
    developmentExamples: [
      "Complete leadership development program",
      "Lead division or center initiative",
      "Build cross-department collaboration",
    ],
  },
  Advocate: {
    objectiveLead: "Policy + Community impact",
    assessmentLead: "Advocacy Impact Score",
    developmentExamples: [
      "Lead health policy initiative",
      "Build community partnership portfolio",
      "Develop media or public engagement presence",
    ],
  },
  Innovator: {
    objectiveLead: "Innovation portfolio + Patents",
    assessmentLead: "Innovation Readiness Score",
    developmentExamples: [
      "Launch clinical innovation pilot",
      "Develop digital health tool or workflow",
      "Secure innovation grant or industry partnership",
    ],
  },
  "Quality-Safety": {
    objectiveLead: "QI projects + Safety metrics",
    assessmentLead: "Quality Leadership Score",
    developmentExamples: [
      "Lead system-wide QI initiative",
      "Publish patient safety scholarship",
      "Achieve quality committee leadership role",
    ],
  },
  "Wellness Champion": {
    subjectiveLead: "Professional Sustainability",
    objectiveLead: "Wellness programs + Outcomes",
    assessmentLead: "Wellness Leadership Score",
    developmentExamples: [
      "Lead physician wellness initiative",
      "Build peer support program",
      "Develop burnout prevention curriculum",
    ],
  },
};

const RANK_OBJECTIVE_OVERLAY: Partial<Record<AcademicRank, string>> = {
  Instructor: "Teaching + Early scholarship",
  "Assistant Professor": "Publications + First grants",
  "Associate Professor": "National visibility + Mentoring",
  "Full Professor": "Field leadership + Legacy",
  Chair: "Department metrics + Strategic plan",
  Emeritus: "Advisory impact + Legacy documentation",
};

export function isAcademicContext(input: AcademicRoleInput): boolean {
  const { setting, level } = input;
  if (setting === "Academic" || setting === "Hybrid") return true;
  if (
    level === "Medical Student" ||
    level === "Resident" ||
    level === "Fellow"
  ) {
    return true;
  }
  return false;
}

export function resolveAcademicProfile(
  input: AcademicRoleInput,
): AcademicProfileAdaptation | null {
  if (!isAcademicContext(input)) return null;

  const level = input.level ?? "Early Career (0–7 yr)";
  const base = LEVEL_BASES[level];
  if (!base) return null;

  const track = (input.track ?? "Clinician") as PrimaryCareerTrack;
  const trackOverlay = TRACK_OVERLAYS[track] ?? TRACK_OVERLAYS.Clinician;
  const rank = input.rank ?? null;

  const promotionFocus =
    (rank && base.promotionByRank[rank]) ??
    (rank ? RANK_OBJECTIVE_OVERLAY[rank] : null) ??
    base.assessmentLead;

  const objectiveLead =
    (rank && RANK_OBJECTIVE_OVERLAY[rank]) ??
    trackOverlay.objectiveLead ??
    base.objectiveLead;

  const developmentExamples = [
    ...(trackOverlay.developmentExamples ?? []),
    ...base.development,
  ].slice(0, 6);

  return {
    bandOrder: base.bandOrder,
    subjectiveLead: trackOverlay.subjectiveLead ?? base.subjectiveLead,
    objectiveLead,
    assessmentLead: trackOverlay.assessmentLead ?? promotionFocus,
    planLead: trackOverlay.planLead ?? base.planLead,
    outputLead: trackOverlay.outputLead ?? base.outputLead,
    promotionFocus,
    developmentExamples,
    maintenanceExamples: base.maintenance,
    sustainabilityExamples: base.sustainability,
    outputTemplates: base.outputTemplates,
    instrumentEmphasis: base.instrumentEmphasis,
    invisibleWorkNote: base.invisibleWorkNote,
  };
}

export function academicSectionGateGreeting(input: {
  section: "subjective" | "objective" | "assessment" | "plan" | "output";
  displayName?: string;
  profile: AcademicRoleInput;
}): string {
  const name = input.displayName?.split(" ")[0] ?? "there";
  const adaptation = resolveAcademicProfile(input.profile);
  if (!adaptation) {
    return `Hi ${name}, let's explore ${input.section} together on the platform.`;
  }

  const leadMap = {
    subjective: adaptation.subjectiveLead,
    objective: adaptation.objectiveLead,
    assessment: adaptation.assessmentLead,
    plan: adaptation.planLead,
    output: adaptation.outputLead,
  };

  const lead = leadMap[input.section];
  const track = input.profile.track ? ` on your ${input.profile.track} track` : "";
  const rank =
    input.profile.rank && input.profile.level !== "Medical Student"
      ? ` as ${input.profile.rank}`
      : "";

  return `Hi ${name}. For academic medicine${track}${rank}, your focus here is **${lead}**. I'll help you review what's current and decide your next step. What would you like to start with?`;
}

export function academicRankOptionsForLevel(
  level: CareerLevel | null,
): AcademicRank[] {
  if (
    level === "Medical Student" ||
    level === "Resident" ||
    level === "Fellow"
  ) {
    return [];
  }
  if (level === "Early Career (0–7 yr)") {
    return ["Instructor", "Assistant Professor"];
  }
  if (level === "Mid-Career (8–20 yr)") {
    return ["Assistant Professor", "Associate Professor", "Full Professor"];
  }
  if (level === "Late Career (20+ yr)" || level === "Retired") {
    return ["Full Professor", "Chair", "Emeritus"];
  }
  return ["Instructor", "Assistant Professor", "Associate Professor", "Full Professor"];
}
