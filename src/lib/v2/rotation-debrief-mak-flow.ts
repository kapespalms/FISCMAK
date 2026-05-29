import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  buildDebriefLayerPrompt,
  buildNarrativeAnchorIntro,
  NARRATIVE_ANCHOR_STEPS,
  normalizeCareerStage,
  type DebriefLayer,
  type NarrativeAnchor,
} from "@/lib/v2/mak-conversation-models";

export type RotationDebriefSession = {
  rotation_name?: string;
  rotation_code?: string;
  block_id?: string;
  phase?: "start" | "mid" | "end";
  step_index: number;
  layer: DebriefLayer;
  layer_question_index: number;
  started_at: string;
  captured_entries: Partial<Record<DebriefLayer, string>>;
};

export type RotationDebriefEntry = {
  id: string;
  rotation_name: string;
  rotation_code?: string;
  block_id?: string;
  phase?: "start" | "mid" | "end";
  completed_at: string;
  facts?: string;
  reflection?: string;
  connection?: string;
  theme_tags?: string[];
};

export type NarrativeAnchorSession = {
  step_index: number;
  started_at: string;
  partial?: NarrativeAnchor;
};

const DEBRIEF_LAYER_ORDER: DebriefLayer[] = ["facts", "reflection", "connection"];
const QUESTIONS_PER_LAYER = 2;

export function getRotationDebriefSession(
  meta: OnboardingMetadata,
): RotationDebriefSession | null {
  return meta.rotation_debrief_session ?? null;
}

export function getNarrativeAnchor(meta: OnboardingMetadata): NarrativeAnchor | null {
  return meta.narrative_anchor ?? null;
}

export function initRotationDebriefSession(
  meta: OnboardingMetadata,
  rotationName?: string,
  options?: {
    phase?: "start" | "mid" | "end";
    block_id?: string;
    rotation_code?: string;
  },
): OnboardingMetadata {
  const phase = options?.phase ?? "end";
  return {
    ...meta,
    rotation_debrief_session: {
      rotation_name: rotationName,
      rotation_code: options?.rotation_code,
      block_id: options?.block_id,
      phase,
      step_index: rotationName ? 1 : 0,
      layer: phase === "end" ? "facts" : "reflection",
      layer_question_index: 0,
      started_at: new Date().toISOString(),
      captured_entries: {},
    },
  };
}

export function initNarrativeAnchorSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    narrative_anchor_session: {
      step_index: 0,
      started_at: new Date().toISOString(),
      partial: meta.narrative_anchor ?? {},
    },
  };
}

export function clearRotationDebriefSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { rotation_debrief_session: _, ...rest } = meta;
  return rest;
}

export function clearNarrativeAnchorSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { narrative_anchor_session: _, ...rest } = meta;
  return rest;
}

export function buildRotationDebriefIntro(
  rotationName?: string,
  phase: "start" | "mid" | "end" = "end",
): string {
  const name = rotationName ? ` **${rotationName}**` : "";

  if (phase === "start") {
    const base = `Let's set intentions for the start of${name}.

Two quick questions — one at a time.`;
    return rotationName
      ? `${base}\n\nWhat do you hope to learn or strengthen on **${rotationName}**?`
      : `${base}\n\nWhat rotation are you starting — and what do you hope to learn?`;
  }

  if (phase === "mid") {
    const base = `Mid-rotation check-in for${name}. One question at a time.`;
    return rotationName
      ? `${base}\n\nWhat's going well on **${rotationName}** so far?`
      : `${base}\n\nWhat's going well on this rotation so far?`;
  }

  return `Let's debrief${name} while it's still fresh — three short layers:

1. **What happened** — setting, cases, skills, feedback
2. **What it meant** — moments that stuck with you
3. **How it connects** — link to your specialty path and one personal-statement sentence

About 3–5 minutes. One question at a time.

${rotationName ? `Starting with ${rotationName}.` : "What rotation or block did you just finish?"}`;
}

export function buildRotationDebriefMakSystemContext(
  meta: OnboardingMetadata,
  careerStage?: string | null,
): string {
  const session = meta.rotation_debrief_session;
  if (!session) return "";
  const prompt = buildDebriefLayerPrompt(session.layer, {
    careerStage,
    rotationName: session.rotation_name,
    anchor: meta.narrative_anchor,
  });

  return [
    `Rotation ${session.phase ?? "end"} touchpoint — layer "${session.layer}", question ${session.layer_question_index + 1}/${QUESTIONS_PER_LAYER}.`,
    prompt,
  ].join("\n\n");
}

export function buildNarrativeAnchorMakSystemContext(
  meta: OnboardingMetadata,
  careerStage?: string | null,
): string {
  const session = meta.narrative_anchor_session;
  if (!session) return "";
  const step = NARRATIVE_ANCHOR_STEPS[session.step_index];
  if (!step) return "Narrative anchor complete.";
  const stage = normalizeCareerStage(careerStage);
  return `Narrative anchor — question ${session.step_index + 1}/${NARRATIVE_ANCHOR_STEPS.length}.
Ask: ${step.prompt(stage, session.partial ?? {})}`;
}

export type DebriefTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  complete: boolean;
};

function advanceLayer(session: RotationDebriefSession): RotationDebriefSession {
  const layerIdx = DEBRIEF_LAYER_ORDER.indexOf(session.layer);
  if (session.layer_question_index + 1 < QUESTIONS_PER_LAYER) {
    return { ...session, layer_question_index: session.layer_question_index + 1 };
  }
  if (layerIdx + 1 < DEBRIEF_LAYER_ORDER.length) {
    return {
      ...session,
      layer: DEBRIEF_LAYER_ORDER[layerIdx + 1]!,
      layer_question_index: 0,
      step_index: session.step_index + 1,
    };
  }
  return { ...session, step_index: 4 };
}

function extractThemeTags(text: string): string[] {
  const themes = [
    "health equity",
    "medical education",
    "psychotherapy",
    "systems impact",
    "advocacy",
    "research",
    "leadership",
    "underserved populations",
    "med-psych interface",
  ];
  const lower = text.toLowerCase();
  return themes.filter((t) => lower.includes(t.split(" ")[0]!));
}

function phaseCompleteStepIndex(phase?: "start" | "mid" | "end"): number {
  if (phase === "start" || phase === "mid") return 3;
  return 4;
}

function phaseFirstQuestion(phase: "start" | "mid" | "end", rotationName?: string): string {
  if (phase === "start") {
    return rotationName
      ? `Starting **${rotationName}**. What do you hope to learn or strengthen on this block?`
      : "What rotation are you starting — and what do you hope to learn?";
  }
  if (phase === "mid") {
    return rotationName
      ? `Mid-block on **${rotationName}**. What's going well so far?`
      : "What's going well on this rotation so far?";
  }
  return rotationName
    ? `Got it — **${rotationName}**.\n\nWhat's the clinical setting, your role, and one thing that stood out clinically?`
    : "What's the clinical setting, your role, and one thing that stood out clinically?";
}

export function processRotationDebriefTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  careerStage?: string | null;
}): DebriefTurnResult {
  let session = input.meta.rotation_debrief_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildRotationDebriefIntro(),
      suggested_actions: [],
      complete: false,
    };
  }

  const phase = session.phase ?? "end";
  const completeAt = phaseCompleteStepIndex(phase);
  const msg = input.message.trim();

  if (session.step_index === 0 && !session.rotation_name && msg.length > 1) {
    session = { ...session, rotation_name: msg.slice(0, 120), step_index: 1 };
    return {
      meta: { ...input.meta, rotation_debrief_session: session },
      response: phaseFirstQuestion(phase, session.rotation_name),
      suggested_actions: [],
      complete: false,
    };
  }

  const layer = session.layer;
  const captured = { ...session.captured_entries };

  if (phase === "start" || phase === "mid") {
    const nextStep = session.step_index + 1;

    if (session.step_index === 1) {
      captured.facts = msg;
    } else if (session.step_index === 2) {
      captured.reflection = msg;
    }

    session = { ...session, step_index: nextStep, captured_entries: captured };

    if (nextStep < completeAt) {
      const q =
        phase === "start"
          ? "What feels unclear or worth planning for upfront?"
          : "What would you adjust for the second half of the block?";
      return {
        meta: { ...input.meta, rotation_debrief_session: session },
        response: `Got it.\n\n${q}`,
        suggested_actions: [],
        complete: false,
      };
    }

    const entry: RotationDebriefEntry = {
      id: crypto.randomUUID(),
      rotation_name: session.rotation_name ?? "Rotation",
      rotation_code: session.rotation_code,
      block_id: session.block_id,
      phase,
      completed_at: new Date().toISOString(),
      facts: phase === "start" ? captured.reflection ?? captured.facts : captured.facts,
      reflection: captured.reflection,
      connection: captured.connection,
      theme_tags: extractThemeTags(Object.values(captured).filter(Boolean).join(" ")),
    };
    const entries = [...(input.meta.rotation_debrief_entries ?? []), entry];
    const cleared = clearRotationDebriefSession(input.meta);
    const withHistory = {
      ...cleared,
      rotation_debrief_entries: entries,
      rotation_touchpoint_history: [
        ...(input.meta.rotation_touchpoint_history ?? []),
        {
          block_id: session.block_id ?? entry.id,
          rotation_code: session.rotation_code ?? "unknown",
          rotation_label: session.rotation_name ?? "Rotation",
          phase,
          completed_at: entry.completed_at,
          notes: [captured.facts, captured.reflection, captured.connection].filter(Boolean).join(" | "),
        },
      ],
    };
    const phaseLabel = phase === "start" ? "Start-of-rotation" : "Mid-rotation";
    return {
      meta: withHistory,
      response: `${phaseLabel} check-in saved for **${entry.rotation_name}**. I'll reference this on your lattice and in goal conversations.`,
      suggested_actions: [
        { action: "Open Career Map", url: "/app/objective?tab=lattice" },
        { action: "View schedule", url: "/app/schedule" },
      ],
      complete: true,
    };
  }

  const existing = captured[layer] ?? "";
  captured[layer] = existing ? `${existing}\n${msg}` : msg;
  session = advanceLayer({ ...session, captured_entries: captured });

  if (session.step_index >= completeAt) {
    const entry: RotationDebriefEntry = {
      id: crypto.randomUUID(),
      rotation_name: session.rotation_name ?? "Rotation",
      rotation_code: session.rotation_code,
      block_id: session.block_id,
      phase: "end",
      completed_at: new Date().toISOString(),
      facts: captured.facts,
      reflection: captured.reflection,
      connection: captured.connection,
      theme_tags: extractThemeTags(
        [captured.facts, captured.reflection, captured.connection].filter(Boolean).join(" "),
      ),
    };
    const entries = [...(input.meta.rotation_debrief_entries ?? []), entry];
    const cleared = clearRotationDebriefSession(input.meta);
    const withHistory = {
      ...cleared,
      rotation_debrief_entries: entries,
      rotation_touchpoint_history: [
        ...(input.meta.rotation_touchpoint_history ?? []),
        {
          block_id: session.block_id ?? entry.id,
          rotation_code: session.rotation_code ?? "unknown",
          rotation_label: session.rotation_name ?? "Rotation",
          phase: "end" as const,
          completed_at: entry.completed_at,
          notes: [captured.facts, captured.reflection, captured.connection].filter(Boolean).join(" | "),
        },
      ],
    };
    return {
      meta: withHistory,
      response: `Debrief saved for **${entry.rotation_name}**.${
        entry.theme_tags?.length ? ` Themes: ${entry.theme_tags.join(", ")}.` : ""
      }

This is now career evidence for your vault, ILP, and personal statement.`,
      suggested_actions: [
        { action: "Capture another rotation", url: "/app/objective?tab=activities" },
        { action: "Draft personal statement", url: "/app/output" },
      ],
      complete: true,
    };
  }

  const nextLayer = session.layer;
  const layerLabels: Record<DebriefLayer, string> = {
    facts: "what happened",
    reflection: "what it meant",
    connection: "how it connects to your path",
  };

  const layerPrompt = buildDebriefLayerPrompt(nextLayer, {
    careerStage: input.careerStage,
    rotationName: session.rotation_name,
    anchor: input.meta.narrative_anchor,
  });

  return {
    meta: { ...input.meta, rotation_debrief_session: session },
    response: `Saved.${session.layer_question_index === 0 ? ` Moving to **${layerLabels[nextLayer]}**.` : ""}

${layerPrompt.split("\n").find((l) => l.startsWith("-")) ?? "Tell me more."}`,
    suggested_actions: [],
    complete: false,
  };
}

export function processNarrativeAnchorTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  careerStage?: string | null;
}): DebriefTurnResult {
  const session = input.meta.narrative_anchor_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildNarrativeAnchorIntro(input.careerStage),
      suggested_actions: [],
      complete: false,
    };
  }

  const stepIdx = session.step_index;
  const step = NARRATIVE_ANCHOR_STEPS[stepIdx];
  if (!step) {
    return {
      meta: clearNarrativeAnchorSession(input.meta),
      response: "Your narrative anchor is set. I'll reference it when we debrief rotations and build application materials.",
      suggested_actions: [{ action: "Debrief a rotation", url: "/app/objective?tab=activities" }],
      complete: true,
    };
  }

  const partial = { ...(session.partial ?? {}), [step.field]: input.message.trim() };
  const nextIdx = stepIdx + 1;
  const nextStep = NARRATIVE_ANCHOR_STEPS[nextIdx];

  if (!nextStep) {
    const anchor: NarrativeAnchor = { ...partial, captured_at: new Date().toISOString() };
    const cleared = clearNarrativeAnchorSession(input.meta);
    return {
      meta: { ...cleared, narrative_anchor: anchor },
      response: `Anchor set. I'll connect future captures back to **${anchor.target_specialty ?? "your path"}**.

When you're ready, debrief your latest rotation — we'll use all three layers automatically.`,
      suggested_actions: [{ action: "Debrief a rotation", url: "/app/objective?tab=activities" }],
      complete: true,
    };
  }

  const stage = normalizeCareerStage(input.careerStage);
  return {
    meta: {
      ...input.meta,
      narrative_anchor_session: { ...session, step_index: nextIdx, partial },
    },
    response: `Got it — that helps shape your story.\n\n${nextStep.prompt(stage, partial)}`,
    suggested_actions: [],
    complete: false,
  };
}
