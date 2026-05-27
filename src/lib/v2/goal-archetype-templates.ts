/**
 * Goal archetype templates — four patterns physicians actually set.
 * Maps to Development / Maintenance / Sustainability buckets; powers Mak + Strategy UI.
 */

import type { GoalFrameworkType } from "@/lib/v2/soap-tab-spec";

export type GoalArchetype =
  | "role_shift"
  | "work_life_integration"
  | "skill_development"
  | "visibility_recognition";

export type GoalArchetypeAnatomy = {
  current_state?: string;
  target_state?: string;
  current_role_profile?: string;
  target_role_profile?: string;
  skills_needed?: string;
  timeline?: string;
  internal_obstacle?: string;
  constraints?: string;
  experiment?: string;
  pathway?: string;
  stakeholders?: string;
  invisible_work?: string;
  formalization_goal?: string;
  current_skills?: string;
  target_credential?: string;
  burnout_signals?: string;
};

export type GoalArchetypeDefinition = {
  id: GoalArchetype;
  label: string;
  pattern: string;
  defaultFor?: GoalFrameworkType;
  anatomyFields: Array<{ key: keyof GoalArchetypeAnatomy; label: string }>;
  example: {
    title: string;
    anatomy: GoalArchetypeAnatomy;
  };
};

export const GOAL_ARCHETYPE_DEFINITIONS: Record<GoalArchetype, GoalArchetypeDefinition> = {
  role_shift: {
    id: "role_shift",
    label: "Role shift",
    pattern: "Move from one career identity to another",
    defaultFor: "development",
    anatomyFields: [
      { key: "current_role_profile", label: "Current role profile" },
      { key: "target_role_profile", label: "Target role profile" },
      { key: "skills_needed", label: "Skills for transition" },
      { key: "timeline", label: "Timeline" },
      { key: "internal_obstacle", label: "Internal obstacle" },
    ],
    example: {
      title: "Researcher → Leader",
      anatomy: {
        current_role_profile: "40% clinical, 30% research, 20% teaching, 10% admin",
        target_role_profile: "30% clinical, 10% research, 20% teaching, 20% mentoring, 10% admin",
        skills_needed: "Formal mentoring, delegation, systems thinking",
        timeline: "18 months",
        internal_obstacle: 'Identity inertia — "I\'ve been a researcher for 12 years"',
      },
    },
  },
  work_life_integration: {
    id: "work_life_integration",
    label: "Work-life integration",
    pattern: "Achieve sustainable balance without burnout",
    defaultFor: "sustainability",
    anatomyFields: [
      { key: "burnout_signals", label: "Current burnout signals" },
      { key: "target_state", label: "Target sustainable pattern" },
      { key: "constraints", label: "Constraints" },
      { key: "experiment", label: "Experiment to run" },
      { key: "internal_obstacle", label: "Internal obstacle" },
    ],
    example: {
      title: "50/50 clinical/research without burnout",
      anatomy: {
        burnout_signals: "Feeling depleted; 60% clinical + 30% research + overload → resentment",
        target_state: "50% clinical, 50% research, sustainable energy",
        constraints: "Can't relocate; kids in school",
        experiment: "Negotiate one protected research day per week",
        internal_obstacle: 'Guilt — "Am I abandoning my patients?"',
      },
    },
  },
  skill_development: {
    id: "skill_development",
    label: "Skill development",
    pattern: "Build new competencies with a clear pathway",
    defaultFor: "development",
    anatomyFields: [
      { key: "current_skills", label: "Current skills" },
      { key: "target_credential", label: "Target credential or skill" },
      { key: "pathway", label: "Pathway & milestones" },
      { key: "timeline", label: "Timeline" },
      { key: "internal_obstacle", label: "Internal obstacle" },
    ],
    example: {
      title: "Build formal leadership credentials",
      anatomy: {
        current_skills: "Clinical expert, ad-hoc mentoring",
        target_credential: "Formal leadership credential (MBA, fellowship, or internal program)",
        pathway: "Course (6 mo) → internship (6 mo) → certification (6 mo) → role transition (6 mo)",
        timeline: "2 years",
        internal_obstacle: 'Imposter syndrome — "I don\'t belong with real leaders"',
      },
    },
  },
  visibility_recognition: {
    id: "visibility_recognition",
    label: "Visibility & recognition",
    pattern: "Get credit for invisible work",
    defaultFor: "maintenance",
    anatomyFields: [
      { key: "invisible_work", label: "Invisible work today" },
      { key: "formalization_goal", label: "Formalization goal" },
      { key: "stakeholders", label: "Stakeholders" },
      { key: "timeline", label: "Timeline" },
      { key: "internal_obstacle", label: "Internal obstacle" },
    ],
    example: {
      title: "Get credit for mentorship",
      anatomy: {
        invisible_work: "20 hrs/month mentoring, zero recognition, no role title",
        formalization_goal: "Formal mentorship program with title and teaching relief",
        stakeholders: "Department chair, faculty committee",
        timeline: "12 months — proposal → pilot → formalization",
        internal_obstacle: 'Fear of asking — "Who am I to ask for this?"',
      },
    },
  },
};

export const GOAL_ARCHETYPE_ORDER: GoalArchetype[] = [
  "role_shift",
  "work_life_integration",
  "skill_development",
  "visibility_recognition",
];

export function defaultArchetypeForFramework(type: GoalFrameworkType): GoalArchetype {
  if (type === "sustainability") return "work_life_integration";
  if (type === "maintenance") return "visibility_recognition";
  return "skill_development";
}

export function inferGoalArchetype(text: string): GoalArchetype | undefined {
  const lower = text.toLowerCase();
  if (
    /invisible|recognition|credit|formalize|formal program|title|teaching relief|zero recognition/.test(
      lower,
    )
  ) {
    return "visibility_recognition";
  }
  if (
    /burnout|balance|sustainable|50\/50|depleted|resentment|protected day|work.?life|overload|guilt.*patient/.test(
      lower,
    )
  ) {
    return "work_life_integration";
  }
  if (
    /transition|move from|researcher.*leader|leader|role shift|identity|admin|mentoring director|program director/.test(
      lower,
    )
  ) {
    return "role_shift";
  }
  if (
    /credential|certificate|mba|fellowship|competency|skill|leadership program|course|certification|build formal/.test(
      lower,
    )
  ) {
    return "skill_development";
  }
  return undefined;
}

export function resolveGoalArchetype(input: {
  text?: string;
  frameworkType?: GoalFrameworkType;
  explicit?: GoalArchetype | null;
}): GoalArchetype {
  if (input.explicit) return input.explicit;
  return inferGoalArchetype(input.text ?? "") ?? defaultArchetypeForFramework(input.frameworkType ?? "development");
}

export function buildAnatomyDisplay(
  archetype: GoalArchetype,
  anatomy?: GoalArchetypeAnatomy | null,
): string[] {
  const def = GOAL_ARCHETYPE_DEFINITIONS[archetype];
  const lines: string[] = [];
  for (const field of def.anatomyFields) {
    const value = anatomy?.[field.key]?.trim();
    if (value) lines.push(`**${field.label}:** ${value}`);
  }
  return lines;
}

export function buildGoalArchetypeSummaryBlock(
  archetype: GoalArchetype,
  anatomy?: GoalArchetypeAnatomy | null,
): string {
  const def = GOAL_ARCHETYPE_DEFINITIONS[archetype];
  const lines = buildAnatomyDisplay(archetype, anatomy);
  if (!lines.length) {
    return `**Pattern:** ${def.label} — ${def.pattern}\n\n_Mak can help fill in current state, target, timeline, and the internal obstacle that usually derails this._`;
  }
  return `**Pattern:** ${def.label}\n${lines.join("\n")}`;
}

export function buildGoalArchetypeMakContext(): string {
  return `Goal archetypes (internal — never list as "Type 1–4"):
- Role shift: current vs target role profile, skills, timeline, identity inertia obstacle
- Work-life integration: burnout signals, sustainable target, constraints, experiment, guilt/fear obstacle
- Skill development: current skills, target credential, pathway milestones, imposter obstacle
- Visibility/recognition: invisible work hours, formalization goal, stakeholders, fear-of-asking obstacle
Always surface internal_obstacle — feeds WOOP obstacle step. Match archetype to goal content; default development→skill/role, maintenance→visibility, sustainability→work-life.`;
}

export function woopObstacleHint(
  archetype: GoalArchetype,
  anatomy?: GoalArchetypeAnatomy | null,
): string | undefined {
  return anatomy?.internal_obstacle?.trim() ?? GOAL_ARCHETYPE_DEFINITIONS[archetype].example.anatomy.internal_obstacle;
}

export function demoAnatomyForArchetype(
  archetype: GoalArchetype,
): GoalArchetypeAnatomy {
  return { ...GOAL_ARCHETYPE_DEFINITIONS[archetype].example.anatomy };
}
