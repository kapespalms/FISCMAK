import type { CareerStage, PracticeSetting, PrimaryCareerTrack, AcademicRank } from "@/lib/v2/onboarding-options";
import type { GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import type { CareerGoal } from "@/lib/goals";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";

export type GoalMilestone = {
  id: string;
  label: string;
  quarter: string;
  status: "pending" | "in_progress" | "completed" | "deferred";
  completedDetail?: string;
};

export type StructuredGoal = {
  type: GoalFrameworkType;
  title: string;
  rationale: string;
  progress: number;
  milestones: GoalMilestone[];
  latticeCells?: string[];
  invisibleWorkTargets?: string[];
};

export type GoalAdaptationRow = {
  setting: PracticeSetting | "Resident/Fellow" | "Medical Student";
  level: CareerStage | "Any Level";
  development: string[];
  maintenance: string[];
  sustainability: string[];
};

export const GOAL_ADAPTATION_MATRIX: GoalAdaptationRow[] = [
  {
    setting: "Academic",
    level: "Early Career (0–7 yr)",
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
  },
  {
    setting: "Academic",
    level: "Mid-Career (8–20 yr)",
    development: [
      "Build national reputation",
      "Develop leadership competency",
      "Pivot to new track",
      "Secure R01",
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
  },
  {
    setting: "Academic",
    level: "Late Career (20+ yr)",
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
  },
  {
    setting: "Community",
    level: "Early Career (0–7 yr)",
    development: [
      "Expand scope of practice",
      "Build quality portfolio",
      "Develop community leadership",
    ],
    maintenance: [
      "Maintain clinical volume and quality metrics",
      "Sustain patient satisfaction",
    ],
    sustainability: [
      "Reduce after-hours documentation",
      "Optimize care coordination workflow",
    ],
  },
  {
    setting: "Community",
    level: "Mid-Career (8–20 yr)",
    development: [
      "Pursue medical staff leadership",
      "Develop quality/safety expertise",
      "Explore teaching role",
    ],
    maintenance: [
      "Sustain clinical excellence",
      "Maintain board certification",
    ],
    sustainability: [
      "Address burnout risk",
      "Reduce prior authorization burden",
      "Optimize schedule",
    ],
  },
  {
    setting: "Industry",
    level: "Any Level",
    development: [
      "Deepen therapeutic area expertise",
      "Build cross-functional leadership",
      "Expand advisory network",
    ],
    maintenance: [
      "Maintain clinical identity if desired",
      "Sustain publication record",
    ],
    sustainability: [
      "Manage corporate meeting burden",
      "Protect professional development time",
    ],
  },
  {
    setting: "Resident/Fellow",
    level: "Resident",
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
      "Address training-related strain",
      "Optimize study/work balance",
      "Develop efficiency skills",
    ],
  },
  {
    setting: "Medical Student",
    level: "Medical Student",
    development: [
      "Explore 2+ career tracks",
      "Complete 1 research experience",
      "Build initial professional network",
    ],
    maintenance: [
      "Maintain academic performance",
      "Sustain extracurricular engagement",
    ],
    sustainability: [
      "Manage application stress",
      "Develop sustainable study habits",
      "Build self-care routines",
    ],
  },
];

export function goalExamplesForProfile(input: {
  setting?: PracticeSetting | null;
  level?: CareerStage | null;
  rank?: AcademicRank | null;
  track?: PrimaryCareerTrack | string | null;
}): GoalAdaptationRow | null {
  const { setting, level, rank, track } = input;
  const academic = resolveAcademicProfile({ setting, level, rank, track });
  if (academic && isAcademicContext({ setting, level })) {
    return {
      setting: "Academic",
      level: level ?? "Early Career (0–7 yr)",
      development: academic.developmentExamples,
      maintenance: academic.maintenanceExamples,
      sustainability: academic.sustainabilityExamples,
    };
  }
  if (level === "Medical Student") {
    return GOAL_ADAPTATION_MATRIX.find((r) => r.setting === "Medical Student") ?? null;
  }
  if (level === "Resident" || level === "Fellow") {
    return GOAL_ADAPTATION_MATRIX.find((r) => r.setting === "Resident/Fellow") ?? null;
  }
  if (setting === "Industry") {
    return GOAL_ADAPTATION_MATRIX.find((r) => r.setting === "Industry") ?? null;
  }
  return (
    GOAL_ADAPTATION_MATRIX.find((r) => r.setting === setting && r.level === level) ??
    GOAL_ADAPTATION_MATRIX.find((r) => r.setting === setting) ??
    null
  );
}

export function careerGoalsToStructuredGoals(goals: CareerGoal[]): StructuredGoal[] {
  return goals.map((g) => {
    const actions = g.recommended_actions ?? [];
    const firstOpen = actions.findIndex((a) => !/COMPLETED/i.test(a));
    const milestones: GoalMilestone[] = actions.map((a, i) => {
      const completed = /COMPLETED/i.test(a);
      const quarterMatch = a.match(/^(Q[1-4]\s+\d{4})/);
      return {
        id: `${g.id}-m${i}`,
        label: a.replace(/\s*—\s*COMPLETED.*$/i, "").replace(/^Q[1-4]\s+\d{4}:\s*/, "").trim(),
        quarter: quarterMatch?.[1] ?? `Step ${i + 1}`,
        status: completed
          ? "completed"
          : i === firstOpen
            ? "in_progress"
            : "pending",
        completedDetail: completed ? "Completed" : undefined,
      };
    });
    const completedCount = actions.filter((a) => /COMPLETED/i.test(a)).length;
    const progress = actions.length ? Math.round((completedCount / actions.length) * 100) : 0;
    const type = (g.goal_type as GoalFrameworkType | null) ?? "development";

    return {
      type,
      title: g.goal_title,
      rationale: g.why_this_fits ?? g.goal_description ?? "",
      progress,
      milestones,
    };
  });
}

export function defaultStructuredGoals(input: {
  careerObjective?: string | null;
  primaryTrack?: PrimaryCareerTrack | string | null;
  specialty?: string | null;
  setting?: PracticeSetting | null;
  unreasonableTaskScore?: number | null;
  unrecognizedWorkHours?: number | null;
  teachingPercentile?: number | null;
}): StructuredGoal[] {
  const objective = input.careerObjective ?? "your stated 3-year career objective";
  const unreasonable = input.unreasonableTaskScore ?? 3.2;
  const unrecognized = input.unrecognizedWorkHours ?? 10;

  return [
    {
      type: "development",
      title: "Build educational leadership portfolio",
      rationale: `Your Career Profile shows strong teaching skills${input.teachingPercentile ? ` (${input.teachingPercentile}th percentile)` : ""} but limited educational leadership experience. Your stated 3-year objective is ${objective}. The gap is primarily in educational leadership, accreditation experience, and educational scholarship.`,
      progress: 60,
      latticeCells: [
        "Educator × Leadership/Management",
        "Educator × Scholarship & Learning",
      ],
      milestones: [
        {
          id: "dev-1",
          label: "Complete education leadership certificate program",
          quarter: "Q3 2026",
          status: "completed",
          completedDetail: "Certificate earned",
        },
        {
          id: "dev-2",
          label: "Submit 1 education scholarship manuscript",
          quarter: "Q4 2026",
          status: "in_progress",
        },
        {
          id: "dev-3",
          label: "Take on clerkship or rotation director role",
          quarter: "Q1 2027",
          status: "pending",
        },
        {
          id: "dev-4",
          label: "Apply for associate program director or program director position",
          quarter: "Q2 2027",
          status: "pending",
        },
      ],
    },
    {
      type: "maintenance",
      title: "Sustain clinical teaching excellence",
      rationale:
        "Teaching evaluations are in a strong percentile — a significant professional strength. As administrative responsibilities expand, there is documented risk of teaching quality erosion. Protecting this strength is essential for professional identity and advancement portfolio.",
      progress: 80,
      latticeCells: ["Clinician × Clinical Expertise", "Educator × Communication"],
      milestones: [
        {
          id: "maint-1",
          label: "Confirm teaching schedule protected at ≥60% of current hours",
          quarter: "Q3 2026",
          status: "completed",
        },
        {
          id: "maint-2",
          label: "Mid-year teaching evaluation check — maintain ≥4.5/5.0",
          quarter: "Q4 2026",
          status: "in_progress",
        },
        {
          id: "maint-3",
          label: "Submit teaching award nomination",
          quarter: "Q1 2027",
          status: "pending",
        },
        {
          id: "maint-4",
          label: "Annual teaching portfolio update completed",
          quarter: "Q2 2027",
          status: "pending",
        },
      ],
    },
    {
      type: "sustainability",
      title: "Optimize task alignment",
      rationale: `Your Task Alignment data shows 35% of work time spent on tasks outside your core professional role, with ${unrecognized} hours/week of unrecognized work. Your unreasonable task score (${unreasonable.toFixed(1)}/5.0) is above the median for your specialty. Reducing this burden will protect professional engagement and reduce strain risk.`,
      progress: 30,
      latticeCells: [
        "Wellness Champion × Systems Thinking",
        "Clinician × Personal & Professional Development",
      ],
      invisibleWorkTargets: [
        "Documentation Overspill (unnecessary — system-level fix)",
        "Care Coordination (unreasonable — delegation candidate)",
      ],
      milestones: [
        {
          id: "sust-1",
          label:
            "Identify top 2 categories of unrecognized work (Documentation Overspill: 4 hrs/week; Care Coordination: 3 hrs/week)",
          quarter: "Q3 2026",
          status: "completed",
        },
        {
          id: "sust-2",
          label:
            "Implement 1 delegation or workflow change for Documentation Overspill",
          quarter: "Q4 2026",
          status: "in_progress",
        },
        {
          id: "sust-3",
          label: `Reduce total unrecognized work from ${unrecognized} to ≤8 hours/week`,
          quarter: "Q1 2027",
          status: "pending",
        },
        {
          id: "sust-4",
          label: `Achieve unreasonable task score ≤2.5/5.0 (from ${unreasonable.toFixed(1)})`,
          quarter: "Q2 2027",
          status: "pending",
        },
      ],
    },
  ];
}

export const GOAL_MODIFY_PROMPT = `Which aspect would you like to modify?

1. The goal itself — change the objective
2. The milestones — adjust timelines, add or remove milestones
3. The scope — make it more or less ambitious`;

export const GOAL_REPLACE_PROMPT = `Describe your goal in one sentence. The platform will help structure it with SMART milestones.

Example: "I want to transition from clinical practice to medical education leadership"`;

export function buildGoalReplaceDraft(freeText: string): string {
  return `Based on your input, here is a structured version:

Development Goal: ${freeText.trim()}

Rationale: Your Career Profile shows strong clinical and teaching foundations. The transition requires building administrative competency, educational scholarship, and accreditation experience.

Proposed milestones will be generated for the next four quarters based on your Career Map gaps.

Choose an option below.`;
}

export function buildQuarterlyGoalReview(input: {
  quarterLabel: string;
  goals: StructuredGoal[];
}): string {
  const { quarterLabel, goals } = input;
  const sections = goals.map((g) => {
    const due = g.milestones.find((m) => m.status === "in_progress" || m.status === "pending");
    const dueLine = due
      ? `Milestone due this quarter: ${due.label}\nStatus options: Completed | In progress | Not started | Deferred to next quarter`
      : "No milestone due this quarter — review overall progress.";
    return `${g.type.toUpperCase()} GOAL: ${g.title}\n\nProgress: ${g.progress}%\n\n${dueLine}`;
  });
  return `Quarterly Goal Review — ${quarterLabel}\n\n${sections.join("\n\n---\n\n")}`;
}

export function buildAnnualGoalResetSummary(input: {
  goals: StructuredGoal[];
  careerHealthStart: number;
  careerHealthEnd: number;
  alignmentStart: number;
  alignmentEnd: number;
}): string {
  const goalLines = input.goals
    .map((g) => {
      const completed = g.milestones.filter((m) => m.status === "completed").length;
      return `${g.type.toUpperCase()} GOAL: ${g.title}\nFinal status: ${g.progress}% complete. ${completed} of ${g.milestones.length} milestones achieved.`;
    })
    .join("\n\n");

  return `Annual Career Strategy Review

It has been 12 months since your goals were established.

${goalLines}

Overall Career Health Score change: ${input.careerHealthStart} → ${input.careerHealthEnd} (+${input.careerHealthEnd - input.careerHealthStart} over 12 months)

Career Alignment change: ${input.alignmentStart}% → ${input.alignmentEnd}% (+${input.alignmentEnd - input.alignmentStart} percentage points)

Based on your updated Career Profile, the platform recommends three new goals for the next 12 months. Confirm, modify, or keep current goals and extend.`;
}

export const DOCUMENTATION_OVERSPILL_STRATEGIES = [
  "Voice dictation with AI-assisted note generation",
  "Template-based documentation for common visit types",
  "Requesting scribe support through department",
  "Batch processing inbox messages at designated times rather than throughout the day",
];

export function sustainabilityStrategyHelp(specialty: string, setting: PracticeSetting): string {
  return `Based on your specialty (${specialty}) and setting (${setting}), common strategies for reducing documentation overspill include:

${DOCUMENTATION_OVERSPILL_STRATEGIES.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Would you like to explore any of these?`;
}

export type SkillTranslationProfile = {
  fromTrack: string;
  toTrack: string;
  transferable: { name: string; score: number; note: string }[];
  gaps: { name: string; current: number; target: number; need: string }[];
  timelineMonths: string;
  pathway: { quarter: string; action: string }[];
};

export function defaultSkillTranslation(): SkillTranslationProfile {
  return {
    fromTrack: "Clinician-Educator",
    toTrack: "Educator-Leader",
    transferable: [
      { name: "Communication", score: 92, note: "directly applicable to leadership communication" },
      { name: "Collaboration & Teamwork", score: 85, note: "foundational for team leadership" },
      { name: "Professionalism & Ethics", score: 88, note: "essential for administrative roles" },
      { name: "Clinical Expertise", score: 78, note: "provides credibility in leadership positions" },
    ],
    gaps: [
      {
        name: "Leadership & Management",
        current: 45,
        target: 75,
        need: "formal leadership training, administrative experience",
      },
      {
        name: "Systems Thinking & Practice",
        current: 52,
        target: 70,
        need: "accreditation experience, curriculum administration",
      },
      {
        name: "Scholarship & Learning",
        current: 56,
        target: 65,
        need: "education scholarship (publications on teaching/curriculum)",
      },
    ],
    timelineMonths: "18–24",
    pathway: [
      { quarter: "Q3–Q4 2026", action: "Complete education leadership certificate + submit 1 education scholarship manuscript" },
      { quarter: "Q1–Q2 2027", action: "Take on clerkship/rotation director role + join accreditation committee" },
      { quarter: "Q3–Q4 2027", action: "Apply for associate program director or program director positions" },
    ],
  };
}

export function buildSkillTranslationGreeting(profile: SkillTranslationProfile): string {
  const transferable = profile.transferable
    .map((t) => `${t.name} (${t.score}/100) — ${t.note}`)
    .join("\n");
  const gaps = profile.gaps
    .map((g) => `${g.name} (${g.current}/100 → target: ${g.target}/100) — need: ${g.need}`)
    .join("\n");
  const pathway = profile.pathway.map((p) => `${p.quarter}: ${p.action}`).join("\n");

  return `You indicated interest in transitioning from ${profile.fromTrack} to ${profile.toTrack}.

Transferable competencies (already strong):
${transferable}

Development needed:
${gaps}

Estimated timeline: ${profile.timelineMonths} months to reach competitive positioning for ${profile.toTrack} roles.

Recommended development pathway:
${pathway}

This pathway can be incorporated into your Development Goal milestones. View on Career Map, adjust timeline, or explore a different track.`;
}

export function buildPlanOnboardingGreeting(): string {
  return `Welcome to Career Strategy. This section helps you set structured career goals based on your Career Profile.

The platform uses a 3-goal framework:
- Development Goal: Build a new competency or advance toward your stated career objective
- Maintenance Goal: Protect and sustain your current professional strengths
- Sustainability Goal: Address task alignment, workload optimization, or professional strain

Based on your Career Profile, the platform has generated 3 suggested goals. Each includes quarterly milestones that are specific, measurable, and time-bound.

Review suggested goals to confirm, modify, or replace any objective.`;
}

export function buildOutputDocumentGreeting(): string {
  return `Which document would you like to work on?

Available documents:
- CV — review for new items since last update
- NIH Biosketch — auto-updated when Career Data changes
- Career Brief — 1-page Career Profile summary
- Cover Letter — position-specific generation
- Personal Statement — applications or promotion
- Advancement Readiness Report — promotion criteria assessment
- Educator Portfolio — teaching activities and scholarship

Or describe what you need in plain language (for example, a letter of intent for a program director position).`;
}

export function milestoneStatusResponse(
  status: "completed" | "in_progress" | "deferred" | "not_started",
  goalTitle: string,
  nextMilestone?: string,
): string {
  if (status === "completed") {
    return `Confirmed. Your Career Data has been updated and progress on "${goalTitle}" has been recalculated.${nextMilestone ? ` Next milestone: ${nextMilestone}.` : ""}`;
  }
  if (status === "deferred") {
    return `Understood. The milestone has been moved to the next quarter. Note: deferring milestones two or more quarters may indicate the goal needs restructuring. Would you like to revisit the goal scope?`;
  }
  if (status === "in_progress") {
    return `Noted. Continue tracking progress on "${goalTitle}" through your quarterly pulse.`;
  }
  return `Would you like help identifying strategies to begin this milestone, or should we adjust the goal scope?`;
}
