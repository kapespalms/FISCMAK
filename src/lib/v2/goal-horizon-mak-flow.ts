/**
 * 6.1: Horizon-aware goal conversation for Coach Mak.
 *
 * Drives a multi-turn Mak conversation that collects the structured fields for
 * each horizon's framework, then writes a goal_records row.
 *
 * Horizons and their framings (spec Part X):
 *   3mo  → SMART  (specific, measurable, achievable, relevant, time_bound)
 *   1yr  → SMART + Implementation Intentions (+ if-then plan)
 *   5yr  → WOOP   (wish, outcome, obstacle, plan)
 *   10yr → legacy (free-form description / narrative)
 *
 * Rules:
 * - Mak helps the physician articulate; never authors goals for them.
 * - One question at a time; supportive tone, skippable fields.
 * - PHI strip on every free-text field before storage (B1 gate).
 * - Writes to goal_records only (one source of truth — not stored_goals).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { stripPhi } from "@/lib/v2/phi-strip";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { GoalHorizon, GoalRecord } from "@/lib/v2/goal-records";
import { HORIZON_FRAMEWORK, HORIZON_LABELS } from "@/lib/v2/goal-records";

export type GoalHorizonSession = {
  horizon: GoalHorizon;
  /** 0 = intro sent, 1.. = collecting fields */
  step: number;
  partial: Partial<GoalRecord>;
  domain_index: number | null;
  started_at: string;
};

export type GoalHorizonTurnResult = {
  response: string;
  meta: OnboardingMetadata;
  complete: boolean;
  saved_goal: GoalRecord | null;
};

// ── Field sequences per horizon ──────────────────────────────────────────────

type FieldDef = { key: keyof GoalRecord; prompt: string; skippable?: boolean };

const SMART_FIELDS: FieldDef[] = [
  {
    key: "specific",
    prompt:
      "What specifically do you want to accomplish in the next 3 months? (One clear, concrete statement.)",
  },
  {
    key: "measurable",
    prompt:
      "How will you know you've achieved it — what would you be able to see, count, or point to?",
  },
  {
    key: "achievable",
    prompt:
      "Is this realistic given your current role and time? What would make it feel achievable?",
    skippable: true,
  },
  {
    key: "relevant",
    prompt:
      "Why does this matter to you right now — what connects it to the career you're building?",
  },
  {
    key: "time_bound",
    prompt: "When exactly — what's the deadline or the signal that time is up?",
  },
];

const SMART_II_EXTRA: FieldDef = {
  key: "implementation_intention",
  prompt:
    "One last piece: the if-then plan. If [obstacle], then I will [response]. Complete that for your goal — even a rough version.",
};

const WOOP_FIELDS: FieldDef[] = [
  {
    key: "wish",
    prompt:
      "What's your big career wish for the next 5 years — the version where things go right?",
  },
  {
    key: "outcome",
    prompt:
      "What's the best possible outcome if you achieve this? How would it feel, concretely?",
  },
  {
    key: "obstacle",
    prompt:
      "What's the most important inner obstacle — the thought, feeling, or habit that could get in the way?",
  },
  {
    key: "plan",
    prompt:
      "If that obstacle shows up, what's your plan? Complete: \"If [obstacle], then I will…\"",
  },
];

const LEGACY_FIELDS: FieldDef[] = [
  {
    key: "description",
    prompt:
      "What's the professional legacy you want to leave — the contribution that would feel complete in 10 years?",
  },
];

function fieldsForHorizon(horizon: GoalHorizon): FieldDef[] {
  if (horizon === "3mo") return SMART_FIELDS;
  if (horizon === "1yr") return [...SMART_FIELDS, SMART_II_EXTRA];
  if (horizon === "5yr") return WOOP_FIELDS;
  return LEGACY_FIELDS; // 10yr
}

// ── Public API ────────────────────────────────────────────────────────────────

export function initGoalHorizonSession(
  meta: OnboardingMetadata,
  horizon: GoalHorizon,
  domainIndex?: number | null,
): OnboardingMetadata {
  const session: GoalHorizonSession = {
    horizon,
    step: 0,
    partial: {},
    domain_index: domainIndex ?? null,
    started_at: new Date().toISOString(),
  };
  return { ...meta, goal_horizon_session: session };
}

export function clearGoalHorizonSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { goal_horizon_session: _, ...rest } = meta;
  return rest as OnboardingMetadata;
}

export function getGoalHorizonSession(meta: OnboardingMetadata): GoalHorizonSession | null {
  return (meta as Record<string, unknown>).goal_horizon_session as GoalHorizonSession | null ?? null;
}

export function buildGoalHorizonMakContext(meta: OnboardingMetadata): string {
  const session = getGoalHorizonSession(meta);
  if (!session) return "";
  const framework = HORIZON_FRAMEWORK[session.horizon];
  const label = HORIZON_LABELS[session.horizon];
  return `Active goal conversation: ${label} goal (${framework} framework). Step ${session.step + 1} of ${fieldsForHorizon(session.horizon).length + 1}. Collecting: ${JSON.stringify(session.partial)}.`;
}

/** Build the intro response for the start of a horizon goal conversation. */
function buildHorizonIntro(horizon: GoalHorizon): string {
  const label = HORIZON_LABELS[horizon];
  const framework = HORIZON_FRAMEWORK[horizon];
  const firstField = fieldsForHorizon(horizon)[0]!;

  const preamble: Record<GoalHorizon, string> = {
    "3mo": `Let's set your ${label} goal using a SMART structure — specific, measurable, achievable, relevant, and time-bound. One question at a time; you can skip anything that doesn't fit yet.`,
    "1yr": `For your ${label} goal we'll use SMART with an implementation intention — the "if-then" plan that turns a goal into a commitment. One question at a time.`,
    "5yr": `For your ${label} vision we'll use the WOOP method — Wish, Outcome, Obstacle, Plan. WOOP works because it takes the obstacle seriously, not just the dream.`,
    "10yr": `Your ${label} legacy goal is free-form — no framework, just your honest answer about what would feel complete.`,
  };

  return `${preamble[horizon]}\n\n${firstField.prompt}`;
}

/**
 * Process one Mak turn in the goal-horizon conversation.
 * Returns the next prompt (or completion message) and the updated meta.
 * On the final step: inserts to goal_records and returns the saved goal.
 */
export async function processGoalHorizonTurn(params: {
  message: string;
  meta: OnboardingMetadata;
  userId: string;
  supabase: SupabaseClient;
}): Promise<GoalHorizonTurnResult> {
  const { message, meta, userId, supabase } = params;
  const session = getGoalHorizonSession(meta);
  if (!session) {
    return { response: "", meta, complete: false, saved_goal: null };
  }

  const fields = fieldsForHorizon(session.horizon);

  // step 0 = intro was sent, nothing to record yet → advance to first field
  if (session.step === 0) {
    const updatedMeta: OnboardingMetadata = {
      ...meta,
      goal_horizon_session: { ...session, step: 1 },
    };
    return {
      response: buildHorizonIntro(session.horizon),
      meta: updatedMeta,
      complete: false,
      saved_goal: null,
    };
  }

  // Collect the current field's answer (PHI-stripped)
  const fieldIndex = session.step - 1; // step 1 = fields[0], etc.
  const currentField = fields[fieldIndex];
  const updated = { ...session };

  if (currentField) {
    const stripped = stripPhi(message.trim()).scrubbed;
    const isSkip = /^(skip|later|not sure|n\/a|none)$/i.test(stripped.trim());

    if (!isSkip && stripped.length > 0) {
      updated.partial = { ...session.partial, [currentField.key]: stripped };
    }
  }

  const nextStep = session.step + 1;
  const nextField = fields[nextStep - 1];

  // More fields remain
  if (nextField) {
    const ack = currentField ? `Got it.` : "";
    const updatedMeta: OnboardingMetadata = {
      ...meta,
      goal_horizon_session: { ...updated, step: nextStep },
    };
    return {
      response: ack ? `${ack} ${nextField.prompt}` : nextField.prompt,
      meta: updatedMeta,
      complete: false,
      saved_goal: null,
    };
  }

  // All fields collected — write to goal_records
  const now = new Date().toISOString();
  const framework = HORIZON_FRAMEWORK[session.horizon];
  const partial = updated.partial;

  const { data: goalRow, error } = await supabase
    .from("goal_records")
    .insert({
      user_id:      userId,
      horizon:      session.horizon,
      framework,
      domain_index: session.domain_index,
      specific:     (partial.specific as string | undefined)?.trim() || null,
      measurable:   (partial.measurable as string | undefined)?.trim() || null,
      achievable:   (partial.achievable as string | undefined)?.trim() || null,
      relevant:     (partial.relevant as string | undefined)?.trim() || null,
      time_bound:   (partial.time_bound as string | undefined)?.trim() || null,
      implementation_intention: (partial.implementation_intention as string | undefined)?.trim() || null,
      wish:         (partial.wish as string | undefined)?.trim() || null,
      outcome:      (partial.outcome as string | undefined)?.trim() || null,
      obstacle:     (partial.obstacle as string | undefined)?.trim() || null,
      plan:         (partial.plan as string | undefined)?.trim() || null,
      description:  (partial.description as string | undefined)?.trim() || null,
      created_at:   now,
      updated_at:   now,
    })
    .select()
    .single();

  const dbFailed = !!error || !goalRow;
  if (dbFailed) {
    console.error("[goal-horizon] insert failed:", error?.message);
  }

  const horizon = session.horizon;
  const horizonLabel = HORIZON_LABELS[horizon];
  const completionMsg = dbFailed
    ? `Your ${horizonLabel} goal is captured — I'll save it when the goal system is fully active. You can always update it from the Plan tab.`
    : `Your ${horizonLabel} goal is saved. You can review it in Plan → Goals, and come back any time to refine it.`;

  const savedGoal: GoalRecord | null = goalRow
    ? {
        id:           goalRow.id as string,
        user_id:      userId,
        horizon:      session.horizon,
        framework,
        domain_index: session.domain_index,
        title:        (partial.specific as string | undefined) ?? (partial.wish as string | undefined) ?? (partial.description as string | undefined) ?? "",
        description:  (partial.description as string | undefined) ?? null,
        specific:     (partial.specific as string | undefined) ?? null,
        measurable:   (partial.measurable as string | undefined) ?? null,
        achievable:   (partial.achievable as string | undefined) ?? null,
        relevant:     (partial.relevant as string | undefined) ?? null,
        time_bound:   (partial.time_bound as string | undefined) ?? null,
        implementation_intention: (partial.implementation_intention as string | undefined) ?? null,
        wish:         (partial.wish as string | undefined) ?? null,
        outcome:      (partial.outcome as string | undefined) ?? null,
        obstacle:     (partial.obstacle as string | undefined) ?? null,
        plan:         (partial.plan as string | undefined) ?? null,
        created_at:   now,
        updated_at:   now,
      }
    : null;

  const clearedMeta = clearGoalHorizonSession(meta);
  return {
    response: completionMsg,
    meta: clearedMeta,
    complete: true,
    saved_goal: savedGoal,
  };
}
