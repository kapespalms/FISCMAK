import type { CareerGoal } from "@/lib/goals";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  GOAL_MODIFY_PROMPT,
  GOAL_REPLACE_PROMPT,
  buildGoalReplaceDraft,
  careerGoalsToStructuredGoals,
  defaultStructuredGoals,
  type StructuredGoal,
} from "@/lib/v2/goal-framework";
import {
  buildGoalArchetypeSummaryBlock,
  GOAL_ARCHETYPE_DEFINITIONS,
  resolveGoalArchetype,
  woopObstacleHint,
} from "@/lib/v2/goal-archetype-templates";
import { buildGoalBoardPrompt } from "@/lib/v2/career-board-models";
import {
  WOOP_STEPS,
  buildGoalSettingIdentityIntro,
  buildWoopIntro,
  type GoalWoopRecords,
  type WoopRecord,
} from "@/lib/v2/career-coaching-frameworks";
import { buildGoalArchetypeMakContext } from "@/lib/v2/goal-archetype-templates";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";

export type GoalWoopSession = {
  goal_type: GoalFrameworkType;
  step_index: number;
  partial: WoopRecord;
};

export type GoalSettingSession = {
  mode: "initial" | "modify";
  /** 0 = intro, 1–3 = goal types, 4 = complete */
  step_index: number;
  refine_goal_type?: GoalFrameworkType;
  replace_goal_type?: GoalFrameworkType;
  modify_goal_id?: string;
  woop?: GoalWoopSession;
  started_at: string;
};

const GOAL_ORDER: GoalFrameworkType[] = [
  "development",
  "maintenance",
  "sustainability",
];

export function getGoalSettingSession(
  meta: OnboardingMetadata,
): GoalSettingSession | null {
  return meta.goal_setting_session ?? null;
}

export function initGoalSettingSession(
  meta: OnboardingMetadata,
  mode: GoalSettingSession["mode"] = "initial",
  modifyGoalId?: string,
): OnboardingMetadata {
  let step_index = 0;
  if (mode === "modify" && modifyGoalId) {
    const goals = resolveWorkingGoals(meta);
    const goal = goals.find((g) => g.id === modifyGoalId);
    const type = goal?.goal_type as GoalFrameworkType | undefined;
    const idx = type ? GOAL_ORDER.indexOf(type) : -1;
    step_index = idx >= 0 ? idx + 1 : 1;
  }

  return {
    ...meta,
    goal_setting_session: {
      mode,
      step_index,
      modify_goal_id: modifyGoalId,
      started_at: new Date().toISOString(),
    },
  };
}

export function clearGoalSettingSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { goal_setting_session: _, ...rest } = meta;
  return rest;
}

function structuredToCareerGoals(structured: StructuredGoal[]): CareerGoal[] {
  return structured.map((g, i) => ({
    id: `onboarding-${g.type}`,
    goal_title: g.title,
    goal_description: g.rationale,
    goal_type: g.type,
    goal_archetype: g.goalArchetype ?? null,
    goal_anatomy: g.anatomy ?? null,
    why_this_fits: g.rationale,
    missing_evidence: null,
    recommended_actions: g.milestones.map((m) => {
      const prefix = m.status === "completed" ? "[x] " : "[ ] ";
      return `${prefix}${m.quarter}: ${m.label}`;
    }),
    target_date: null,
    priority: i + 1,
    status: "active" as const,
  }));
}

export function resolveWorkingGoals(meta: OnboardingMetadata): CareerGoal[] {
  if (meta.stored_goals?.length) return meta.stored_goals;
  return structuredToCareerGoals(defaultStructuredGoals({}));
}

function goalForType(goals: CareerGoal[], type: GoalFrameworkType): CareerGoal | undefined {
  return goals.find((g) => g.goal_type === type);
}

function stepToGoalType(stepIndex: number): GoalFrameworkType | null {
  if (stepIndex < 1 || stepIndex > 3) return null;
  return GOAL_ORDER[stepIndex - 1] ?? null;
}

export function buildGoalSettingIntro(careerStage?: string | null): string {
  const identityNote = buildGoalSettingIdentityIntro(careerStage);
  return `${identityNote}

Welcome to Career Strategy. Your Career Profile supports three structured goals:

1. **Development Goal** — build a new competency or advance toward your career objective
2. **Maintenance Goal** — protect and sustain your current professional strengths
3. **Sustainability Goal** — address task alignment, workload, or professional strain

When you confirm each goal, we'll briefly name what could get in the way and your if-then plan — so it sticks, not just sounds good on paper.

We'll walk through all three — Development, then Maintenance, then Sustainability. Use the quick actions below at each step, or open the template on this page to edit directly.

Ready when you are.`;
}

export function buildGoalStepPrompt(
  goal: CareerGoal,
  type: GoalFrameworkType,
  stepNumber: number,
  meta?: OnboardingMetadata,
): string {
  const label = GOAL_FRAMEWORK_LABELS[type].label;
  const milestones = (goal.recommended_actions ?? [])
    .map((m) => `- ${m}`)
    .join("\n");
  const boardBlock = buildGoalBoardPrompt(type, meta?.career_board);
  const archetype = goal.goal_archetype ?? resolveGoalArchetype({ frameworkType: type });
  const anatomyBlock = buildGoalArchetypeSummaryBlock(archetype, goal.goal_anatomy);

  return `**Goal ${stepNumber} of 3 — ${label}**

**${goal.goal_title}**

${goal.goal_description ?? goal.why_this_fits ?? GOAL_FRAMEWORK_LABELS[type].description}

**Why this fits:** ${goal.why_this_fits ?? "Based on your Career Profile gaps and strengths."}

**Goal structure:**
${anatomyBlock}

**Quarterly milestones:**
${milestones || "- Milestones will be generated after you confirm the objective."}
${boardBlock}

Does this ${label.toLowerCase()} fit? When you confirm, we'll name the internal obstacle and an if-then plan so this goal survives real life.

Choose an option below.`;
}

export function buildGoalModifyIntro(goal: CareerGoal): string {
  const type = goal.goal_type as GoalFrameworkType | null;
  const label =
    type && GOAL_FRAMEWORK_LABELS[type]
      ? GOAL_FRAMEWORK_LABELS[type].label
      : "Goal";

  return `Let's refine your **${label}**: "${goal.goal_title}".

${GOAL_MODIFY_PROMPT}

Describe what you'd like to change, or use the quick actions below.`;
}

export function buildGoalSettingComplete(goals: CareerGoal[]): string {
  const lines = goals
    .filter((g) => g.goal_type)
    .map((g) => {
      const type = g.goal_type as GoalFrameworkType;
      return `- ${GOAL_FRAMEWORK_LABELS[type].label}: ${g.goal_title}`;
    })
    .join("\n");

  return `Your three career goals are set:

${lines}

Milestone progress will sync across the dashboard and quarterly reviews. You can edit any goal anytime from this page or ask me to walk through a goal again.

What would you like to focus on first this quarter?`;
}

function isConfirmMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower === "confirm" ||
    lower.includes("looks good") ||
    lower.includes("accept") ||
    lower === "yes" ||
    lower.includes("next goal") ||
    lower.startsWith("start")
  );
}

function isModifyMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower === "modify" || lower.includes("change") || lower.includes("adjust");
}

function isReplaceMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower === "replace" || lower.includes("replace with") || lower.includes("my own");
}

function isTemplateMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("template") ||
    lower.includes("edit in template") ||
    lower.includes("edit on the page") ||
    lower.includes("edit directly")
  );
}

export function goalSettingSuggestedActions(
  session: GoalSettingSession | null,
  stepIndex: number,
): { action: string; url: string }[] {
  if (!session) {
    return [
      { action: "Begin Development Goal", url: "" },
      { action: "Edit in template", url: "/app/plan" },
    ];
  }

  if (session.refine_goal_type || session.replace_goal_type) {
    return [
      { action: "Confirm changes", url: "" },
      { action: "Edit in template", url: "/app/plan" },
    ];
  }

  if (stepIndex >= 4) {
    return [
      { action: "Review goals", url: "/app/plan" },
      { action: "Begin quarterly review", url: "" },
    ];
  }

  if (stepIndex === 0) {
    return [
      { action: "Begin Development Goal", url: "" },
      { action: "Edit in template", url: "/app/plan" },
    ];
  }

  return [
    { action: "Confirm", url: "" },
    { action: "Modify", url: "" },
    { action: "Replace", url: "" },
    { action: "Edit in template", url: "/app/plan" },
  ];
}

/** Default plan-section pills when not in an active goal-setting turn. */
export function planMakQuickActions(goalsConfirmed: boolean): { action: string; url: string }[] {
  if (goalsConfirmed) {
    return [
      { action: "Review with Mak", url: "" },
      { action: "Edit in template", url: "/app/plan" },
    ];
  }
  return [
    { action: "Set up with Mak", url: "" },
    { action: "Edit in template", url: "/app/plan" },
  ];
}

function isSkipWoopMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower === "skip" || lower.includes("skip for now") || lower.includes("skip obstacle");
}

function startWoopSession(
  session: GoalSettingSession,
  goalType: GoalFrameworkType,
  wish: string,
): GoalSettingSession {
  return {
    ...session,
    woop: { goal_type: goalType, step_index: 0, partial: { wish } },
    replace_goal_type: undefined,
    refine_goal_type: undefined,
  };
}

function saveWoopRecord(
  meta: OnboardingMetadata,
  goalType: GoalFrameworkType,
  record: WoopRecord,
): OnboardingMetadata {
  const goals = meta.stored_goals?.length
    ? meta.stored_goals
    : structuredToCareerGoals(defaultStructuredGoals({}));
  const storedGoals = goals.map((g) =>
    g.goal_type === goalType && record.obstacle
      ? {
          ...g,
          goal_anatomy: {
            ...(g.goal_anatomy ?? {}),
            internal_obstacle: record.obstacle,
          },
        }
      : g,
  );

  return {
    ...meta,
    stored_goals: storedGoals,
    goal_woop_records: {
      ...(meta.goal_woop_records ?? {}),
      [goalType]: { ...record, completed_at: new Date().toISOString() },
    },
  };
}

function advanceGoalStep(input: {
  meta: OnboardingMetadata;
  session: GoalSettingSession;
  goals: CareerGoal[];
}): GoalSettingTurnResult {
  const { meta, session, goals } = input;
  const nextIndex = session.step_index + 1;
  if (nextIndex > 3) {
    const finalGoals = meta.stored_goals?.length ? meta.stored_goals : goals;
    const cleared = clearGoalSettingSession(meta);
    return {
      meta: {
        ...cleared,
        stored_goals: finalGoals,
        goals_confirmed: true,
        goals_confirmed_at: new Date().toISOString(),
      },
      response: buildGoalSettingComplete(finalGoals),
      suggested_actions: goalSettingSuggestedActions(null, 4),
      completed: true,
      goals: finalGoals,
    };
  }

  const nextType = stepToGoalType(nextIndex)!;
  const nextGoal = goalForType(meta.stored_goals?.length ? meta.stored_goals : goals, nextType)!;
  const sessionNext = { ...session, step_index: nextIndex, woop: undefined };
  return {
    meta: { ...meta, goal_setting_session: sessionNext },
    response: buildGoalStepPrompt(nextGoal, nextType, nextIndex, meta),
    suggested_actions: goalSettingSuggestedActions(sessionNext, nextIndex),
    completed: false,
  };
}

function processWoopTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  session: GoalSettingSession;
  goals: CareerGoal[];
}): GoalSettingTurnResult | null {
  const woop = input.session.woop;
  if (!woop) return null;

  const trimmed = input.message.trim();
  if (isSkipWoopMessage(trimmed)) {
    const clearedSession = { ...input.session, woop: undefined };
    return advanceGoalStep({
      meta: { ...input.meta, goal_setting_session: clearedSession },
      session: clearedSession,
      goals: input.goals,
    });
  }

  const step = WOOP_STEPS[woop.step_index];
  if (!step || !trimmed) return null;

  const partial = { ...woop.partial, [step.field]: trimmed };
  const nextIdx = woop.step_index + 1;
  const nextStep = WOOP_STEPS[nextIdx];
  const label = GOAL_FRAMEWORK_LABELS[woop.goal_type].label;

  if (!nextStep) {
    let meta = saveWoopRecord(input.meta, woop.goal_type, partial);
    const clearedSession = { ...input.session, woop: undefined };
    meta = { ...meta, goal_setting_session: clearedSession };
    const advance = advanceGoalStep({ meta, session: clearedSession, goals: input.goals });
    return {
      ...advance,
      response: `If-then plan saved — that's what makes this goal survive when resistance shows up.\n\n${advance.response}`,
    };
  }

  return {
    meta: {
      ...input.meta,
      goal_setting_session: {
        ...input.session,
        woop: { ...woop, step_index: nextIdx, partial },
      },
    },
    response: `Got it.\n\n${nextStep.prompt(partial, label)}`,
    suggested_actions: [{ action: "Skip for now", url: "" }],
    completed: false,
  };
}

export type GoalSettingTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  completed: boolean;
  goals?: CareerGoal[];
};

export function processGoalSettingTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  careerStage?: string | null;
}): GoalSettingTurnResult {
  const session = getGoalSettingSession(input.meta);
  if (!session) {
    return {
      meta: input.meta,
      response: buildGoalSettingIntro(input.careerStage),
      suggested_actions: goalSettingSuggestedActions(null, 0),
      completed: false,
    };
  }

  let meta = input.meta;
  let sessionNext: GoalSettingSession = { ...session };
  const goals = resolveWorkingGoals(meta);
  const trimmed = input.message.trim();

  const woopTurn = processWoopTurn({
    message: trimmed,
    meta,
    session: sessionNext,
    goals,
  });
  if (woopTurn) return woopTurn;

  if (isTemplateMessage(trimmed)) {
    return {
      meta,
      response:
        "Open the goal cards on this page — use **Edit** on any goal to update the template directly. I'll stay here if you want to refine wording with me afterward.",
      suggested_actions: [
        { action: "Confirm", url: "" },
        { action: "Modify", url: "" },
        { action: "Edit in template", url: "/app/plan" },
      ],
      completed: false,
    };
  }

  const currentType = stepToGoalType(sessionNext.step_index);
  const currentGoal =
    session.mode === "modify" && session.modify_goal_id
      ? goals.find((g) => g.id === session.modify_goal_id)
      : currentType
        ? goalForType(goals, currentType)
        : undefined;

  if (sessionNext.replace_goal_type && trimmed.length > 8 && !isReplaceMessage(trimmed)) {
    const type = sessionNext.replace_goal_type;
    const archetype = resolveGoalArchetype({ text: trimmed, frameworkType: type });
    const nextGoals = goals.map((g) =>
      g.goal_type === type
        ? {
            ...g,
            goal_title: trimmed,
            goal_description: trimmed,
            goal_archetype: archetype,
            goal_anatomy: g.goal_anatomy ?? null,
            why_this_fits: `${GOAL_ARCHETYPE_DEFINITIONS[archetype].label} goal — physician-defined ${GOAL_FRAMEWORK_LABELS[type].label.toLowerCase()}.`,
          }
        : g,
    );
    meta = { ...meta, stored_goals: nextGoals };
    sessionNext = startWoopSession(sessionNext, type, trimmed);
    const obstacleHint = woopObstacleHint(archetype);
    return {
      meta: { ...meta, goal_setting_session: sessionNext },
      response: `${buildGoalReplaceDraft(trimmed, type)}\n\n${buildWoopIntro(trimmed, GOAL_FRAMEWORK_LABELS[type].label, obstacleHint)}`,
      suggested_actions: [{ action: "Skip for now", url: "" }],
      completed: false,
      goals: nextGoals,
    };
  }

  if (sessionNext.refine_goal_type && trimmed.length > 4) {
    const type = sessionNext.refine_goal_type;
    const nextGoals = goals.map((g) =>
      g.goal_type === type
        ? {
            ...g,
            goal_description: trimmed,
            why_this_fits: trimmed,
          }
        : g,
    );
    meta = { ...meta, stored_goals: nextGoals };
    sessionNext = { ...sessionNext, refine_goal_type: undefined };
    return {
      meta: { ...meta, goal_setting_session: sessionNext },
      response: `Updated. Here's the revised ${GOAL_FRAMEWORK_LABELS[type].label.toLowerCase()}:\n\n${buildGoalStepPrompt(
        goalForType(nextGoals, type)!,
        type,
        GOAL_ORDER.indexOf(type) + 1,
        meta,
      )}`,
      suggested_actions: goalSettingSuggestedActions(sessionNext, sessionNext.step_index),
      completed: false,
      goals: nextGoals,
    };
  }

  if (isModifyMessage(trimmed) && currentGoal && currentType) {
    sessionNext = { ...sessionNext, refine_goal_type: currentType, replace_goal_type: undefined };
    return {
      meta: { ...meta, goal_setting_session: sessionNext },
      response: `${GOAL_MODIFY_PROMPT}\n\nCurrent goal: "${currentGoal.goal_title}"\n\nDescribe what you'd like to change, or choose an option below.`,
      suggested_actions: goalSettingSuggestedActions(sessionNext, sessionNext.step_index),
      completed: false,
    };
  }

  if (isReplaceMessage(trimmed) && currentType) {
    sessionNext = { ...sessionNext, replace_goal_type: currentType, refine_goal_type: undefined };
    return {
      meta: { ...meta, goal_setting_session: sessionNext },
      response: GOAL_REPLACE_PROMPT,
      suggested_actions: goalSettingSuggestedActions(sessionNext, sessionNext.step_index),
      completed: false,
    };
  }

  if (sessionNext.step_index === 0 && (isConfirmMessage(trimmed) || trimmed.toLowerCase().includes("development"))) {
    sessionNext = { ...sessionNext, step_index: 1 };
    const goal = goalForType(goals, "development")!;
    return {
      meta: { ...meta, goal_setting_session: sessionNext },
      response: buildGoalStepPrompt(goal, "development", 1, meta),
      suggested_actions: goalSettingSuggestedActions(sessionNext, 1),
      completed: false,
    };
  }

  if (isConfirmMessage(trimmed) && currentType && currentGoal) {
    const existingWoop = meta.goal_woop_records?.[currentType]?.if_then_plan;
    if (!sessionNext.woop && !existingWoop) {
      sessionNext = startWoopSession(sessionNext, currentType, currentGoal.goal_title);
      const archetype =
        currentGoal.goal_archetype ?? resolveGoalArchetype({ frameworkType: currentType });
      const obstacleHint = woopObstacleHint(archetype, currentGoal.goal_anatomy);
      return {
        meta: { ...meta, goal_setting_session: sessionNext },
        response: buildWoopIntro(
          currentGoal.goal_title,
          GOAL_FRAMEWORK_LABELS[currentType].label,
          obstacleHint,
        ),
        suggested_actions: [{ action: "Skip for now", url: "" }],
        completed: false,
      };
    }

    return advanceGoalStep({
      meta,
      session: sessionNext,
      goals,
    });
  }

  if (session.mode === "modify" && currentGoal && currentType) {
    return {
      meta: { ...meta, goal_setting_session: sessionNext },
      response: buildGoalModifyIntro(currentGoal),
      suggested_actions: goalSettingSuggestedActions(sessionNext, sessionNext.step_index),
      completed: false,
    };
  }

  return {
    meta: { ...meta, goal_setting_session: sessionNext },
    response: sessionNext.step_index === 0
      ? buildGoalSettingIntro(input.careerStage)
      : currentGoal && currentType
        ? buildGoalStepPrompt(currentGoal, currentType, sessionNext.step_index, meta)
        : buildGoalSettingIntro(input.careerStage),
    suggested_actions: goalSettingSuggestedActions(sessionNext, sessionNext.step_index),
    completed: false,
  };
}

export function buildGoalSettingMakSystemContext(
  meta: OnboardingMetadata,
  careerStage?: string | null,
): string {
  const session = getGoalSettingSession(meta);
  if (!session) return "";
  const type = stepToGoalType(session.step_index);
  const goals = resolveWorkingGoals(meta);
  const structured = careerGoalsToStructuredGoals(goals);
  const woopActive = session.woop
    ? `WOOP active for ${session.woop.goal_type} — step ${session.woop.step_index + 1}/3. Do not skip obstacle question unless user says skip.`
    : "";
  return `Goal setting session active (mode: ${session.mode}, step ${session.step_index}/3).
${buildGoalSettingIdentityIntro(careerStage)}
Current focus: ${type ?? "introduction"}.
Working goals: ${structured.map((g) => `${g.type}: ${g.title} (${g.progress}%)`).join("; ")}.
${woopActive}
On Confirm or Replace: run Outcome → Obstacle → If-then plan before advancing (never say WOOP).
Ibarra principle: identity through experiments first, narrative second — never force premature commitment.
At each goal, include Board check questions (mentor/sponsor/coach/connector matched to goal type).
${buildGoalArchetypeMakContext()}
Always offer Confirm, Modify, Replace, or Edit in template.
Do not skip goal types. Keep tone professional, strengths-first, no emojis.`;
}
