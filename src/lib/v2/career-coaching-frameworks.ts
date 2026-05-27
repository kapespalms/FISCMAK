/**
 * Evidence-informed coaching frameworks (internal orchestration — never expose names to users).
 * Ibarra: identity through action → narrative. GROW: exploration. WOOP: committed goal follow-through.
 */

import type { GoalFrameworkType } from "@/lib/v2/soap-tab-spec";

export type GrowExplorationContext = {
  goal?: string;
  reality?: string;
  options?: string;
  way_forward?: string;
  captured_at?: string;
};

export type WoopRecord = {
  wish: string;
  outcome?: string;
  obstacle?: string;
  if_then_plan?: string;
  completed_at?: string;
};

export type GoalWoopRecords = Partial<Record<GoalFrameworkType, WoopRecord>>;

export type IbarraStage =
  | "med_student"
  | "resident"
  | "fellow"
  | "early_attending"
  | "mid_career"
  | "late_career";

function normalizeIbarraStage(careerStage?: string | null): IbarraStage {
  const s = (careerStage ?? "").toLowerCase();
  if (s.includes("medical student") || s.includes("med student")) return "med_student";
  if (s.includes("fellow")) return "fellow";
  if (s.includes("resident")) return "resident";
  if (s.includes("early career")) return "early_attending";
  if (s.includes("late career") || s.includes("retired")) return "late_career";
  if (s.includes("mid-career")) return "mid_career";
  return "mid_career";
}

export function resolveIbarraStage(careerStage?: string | null): IbarraStage {
  return normalizeIbarraStage(careerStage);
}

/** Ibarra working identity — stage-specific Mak guidance (no citation in user-facing text). */
export function buildIbarraStageCoachingBlock(careerStage?: string | null): string {
  const stage = resolveIbarraStage(careerStage);
  const byStage: Record<IbarraStage, string> = {
    med_student:
      "Identity stage (trainee): Multiple small experiments running at once is healthy. Never push premature closure — help identify experiments worth running, then reflect on what they revealed. Action first, narrative second.",
    resident:
      "Identity stage (trainee): Multiple experiments are correct. Warn against locking in too early. Help name experiments (committee, collaboration, clinical role) and build narrative from what actually happened.",
    fellow:
      "Identity stage (trainee): Subspecialty experiments are data — not yet a final story. Connect threads: does this experiment fit other things they're building?",
    early_attending:
      "Identity stage (early career): Find the thread connecting experiments into coherence. Ask: does this connect to other work or become another loose end? Obstacle is often fear of saying no.",
    mid_career:
      "Identity stage (mid-career): Reclaim meaning crowded out, or build toward next chapter. Obstacle is often identity inertia — changing feels like admitting the past was wrong. Reframe as evolution.",
    late_career:
      "Identity stage (late career): Legacy framing — not 'who am I becoming' but 'what ripple am I leaving.' Narrative task is different from early career.",
  };
  return byStage[stage];
}

export const GROW_EXPLORATION_STEPS: Array<{
  field: keyof GrowExplorationContext;
  prompt: (partial: Partial<GrowExplorationContext>) => string;
}> = [
  {
    field: "goal",
    prompt: () =>
      "When you think about where you want your career to go — what does good look like? Not the safe answer. The real one.",
  },
  {
    field: "reality",
    prompt: () =>
      "Where are you actually right now? What's working, what isn't — and which constraints are real versus ones you've assumed?",
  },
  {
    field: "options",
    prompt: ({ goal }) => {
      const hint = goal ? `You said good looks like: "${goal.slice(0, 120)}…" ` : "";
      return `${hint}What are all the possible directions from here? Don't filter yet — what's actually possible?`;
    },
  },
  {
    field: "way_forward",
    prompt: ({ options }) => {
      const hint = options ? "From those options, " : "";
      return `${hint}which one feels most worth **testing** — not committing forever, just trying? What's the smallest real step you could take this quarter?`;
    },
  },
];

export function buildGrowExplorationIntro(): string {
  return `Before locking in a direction, let's explore what you actually want — without forcing a commitment.

I'll ask four questions: what good looks like, where you are now, what's possible, and the smallest step worth testing. Identity gets built through experiments first; the story comes later.

${GROW_EXPLORATION_STEPS[0]!.prompt({})}`;
}

export const WOOP_STEPS: Array<{
  field: keyof WoopRecord;
  prompt: (partial: WoopRecord, goalLabel: string) => string;
}> = [
  {
    field: "outcome",
    prompt: (partial) =>
      `For "${partial.wish}" — if you achieved it, what would that **feel** like day to day? Be concrete, not abstract.`,
  },
  {
    field: "obstacle",
    prompt: () =>
      "What **inside you** might get in the way — fear of failure, identity inertia, imposter feelings, perfectionism, or comfort with the status quo? Name it explicitly.",
  },
  {
    field: "if_then_plan",
    prompt: (partial) =>
      `If ${partial.obstacle ? `"${partial.obstacle.slice(0, 80)}"` : "that resistance"} shows up, what will you do? Finish this: **If** [obstacle], **then I will** [one specific action].`,
  },
];

export function buildWoopIntro(wish: string, goalLabel: string, obstacleHint?: string): string {
  const hintBlock = obstacleHint
    ? `\n\nFor this type of goal, physicians often name something like: _"${obstacleHint}"_ — but name yours in your own words.`
    : "";
  return `Good — let's make "${wish}" stick, not just sound good on paper.

Three quick questions: how success would feel, what inside you might derail it, and a pre-decided if-then plan. This takes about two minutes.${hintBlock}

${WOOP_STEPS[0]!.prompt({ wish }, goalLabel)}`;
}

export function buildGoalSettingIdentityIntro(careerStage?: string | null): string {
  const stage = resolveIbarraStage(careerStage);
  const stageNote =
    stage === "med_student" || stage === "resident" || stage === "fellow"
      ? "Career identity is built through small experiments — then you shape the story from what you learned. No need to have it all figured out first."
      : stage === "early_attending"
        ? "Goals work best when they connect the experiments you're already running — not add another loose end."
        : stage === "mid_career"
          ? "Changing direction isn't admitting the past was wrong — it's the next chapter."
          : "Goals at this stage can focus on legacy and what you want to leave behind.";

  return stageNote;
}

export function buildGrowExplorationSystemContext(partial?: Partial<GrowExplorationContext>): string {
  return `GROW exploration (internal — never say GROW): solution-focused exploration before commitment.
Goal: ${partial?.goal ?? "pending"}
Reality: ${partial?.reality ?? "pending"}
Options: ${partial?.options ?? "pending"}
Way forward: ${partial?.way_forward ?? "pending"}
Do not propose pathways until physician has articulated their own options first. Emphasize smallest testable step, not permanent commitment.`;
}

export function buildWoopSystemContext(
  records?: GoalWoopRecords | null,
  active?: WoopRecord | null,
): string {
  const lines: string[] = [
    "WOOP commitment (internal — never say WOOP): Wish → Outcome → Obstacle → If-then plan.",
    "Do not skip obstacle — internal resistance is what derails physician goals.",
    "If-then plans must be concrete and pre-decided.",
  ];
  if (active?.wish) {
    lines.push(`Active WOOP wish: ${active.wish}`);
    if (active.outcome) lines.push(`Outcome: ${active.outcome}`);
    if (active.obstacle) lines.push(`Obstacle: ${active.obstacle}`);
  }
  if (records && Object.keys(records).length) {
    lines.push(
      `Saved WOOP: ${Object.entries(records)
        .map(([t, r]) => `${t}: ${r?.wish ?? ""}`)
        .join("; ")}`,
    );
  }
  return lines.join("\n");
}

export function buildGoalCoachingFrameworkBlock(careerStage?: string | null): string {
  return [buildIbarraStageCoachingBlock(careerStage), buildWoopSystemContext()].join("\n\n");
}
