import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  BOARD_ROLE_ORDER,
  BOARD_ROLE_LABELS,
  buildBoardAwarenessIntro,
  buildBoardGapSummary,
  buildBoardRolePrompt,
  buildBoardSourcingMenu,
  buildColdOutreachGuidance,
  computeBoardGaps,
  parseBoardRole,
  parseRelationshipStrength,
  parseSourcingPath,
  rosterToBoardMembers,
  type BoardRole,
  type CareerBoardSnapshot,
} from "@/lib/v2/career-board-models";

export type BoardAwarenessSession = {
  step_index: number;
  roster: Partial<Record<BoardRole, string>>;
  started_at: string;
};

export type BoardBuildingSession = {
  step: "pick_role" | "person_name" | "relationship" | "sourcing" | "complete";
  role?: BoardRole;
  person_name?: string;
  relationship?: "strong" | "weak" | "none";
  started_at: string;
};

export type BoardFlowTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  complete: boolean;
};

export function initBoardAwarenessSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    board_awareness_session: {
      step_index: 0,
      roster: {},
      started_at: new Date().toISOString(),
    },
  };
}

export function clearBoardAwarenessSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { board_awareness_session: _, ...rest } = meta;
  return rest;
}

export function initBoardBuildingSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    board_building_session: {
      step: "pick_role",
      started_at: new Date().toISOString(),
    },
  };
}

export function clearBoardBuildingSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { board_building_session: _, ...rest } = meta;
  return rest;
}

function mergeBoardSnapshot(
  meta: OnboardingMetadata,
  members: CareerBoardSnapshot["members"],
): CareerBoardSnapshot {
  const existing = meta.career_board?.members ?? [];
  const byKey = new Map(existing.map((m) => [`${m.role}:${m.name.toLowerCase()}`, m]));
  for (const member of members) {
    byKey.set(`${member.role}:${member.name.toLowerCase()}`, member);
  }
  const merged = [...byKey.values()];
  return {
    members: merged,
    gaps: computeBoardGaps(merged),
    last_assessed_at: new Date().toISOString(),
  };
}

export function processBoardAwarenessTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): BoardFlowTurnResult {
  const session = input.meta.board_awareness_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildBoardAwarenessIntro(),
      suggested_actions: [],
      complete: false,
    };
  }

  const trimmed = input.message.trim();
  const roleIndex = session.step_index;
  const currentRole = BOARD_ROLE_ORDER[roleIndex];

  if (currentRole && trimmed) {
    const roster = { ...session.roster, [currentRole]: trimmed };
    const nextIndex = roleIndex + 1;
    const nextRole = BOARD_ROLE_ORDER[nextIndex];

    if (!nextRole) {
      const { gaps, text } = buildBoardGapSummary(roster);
      const members = rosterToBoardMembers(roster);
      const board = mergeBoardSnapshot(input.meta, members);
      board.gaps = gaps;
      const cleared = clearBoardAwarenessSession(input.meta);
      return {
        meta: { ...cleared, career_board: board },
        response: `${text}\n\nWant to build a missing role now, or link your Board to a specific goal in Career Strategy?`,
        suggested_actions: [
          { action: "Build a Board role", url: "/app/plan" },
          { action: "Set goals with Mak", url: "/app/plan" },
        ],
        complete: true,
      };
    }

    return {
      meta: {
        ...input.meta,
        board_awareness_session: {
          ...session,
          step_index: nextIndex,
          roster,
        },
      },
      response: `Got it.\n\n${buildBoardRolePrompt(nextRole, roster)}`,
      suggested_actions: [],
      complete: false,
    };
  }

  if (currentRole) {
    return {
      meta: input.meta,
      response: buildBoardRolePrompt(currentRole, session.roster),
      suggested_actions: [],
      complete: false,
    };
  }

  return {
    meta: input.meta,
    response: buildBoardAwarenessIntro(),
    suggested_actions: [],
    complete: false,
  };
}

export function processBoardBuildingTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  institution?: string | null;
  specialty?: string | null;
}): BoardFlowTurnResult {
  const session = input.meta.board_building_session;
  if (!session) {
    return {
      meta: initBoardBuildingSession(input.meta),
      response: `Which Board role do you want to build or strengthen — **mentor**, **sponsor**, **coach**, or **connector**?

If you're thinking of a specific person, tell me their name and role.`,
      suggested_actions: [],
      complete: false,
    };
  }

  const trimmed = input.message.trim();

  if (session.step === "pick_role") {
    const role = parseBoardRole(trimmed);
    if (!role) {
      return {
        meta: { ...input.meta, board_building_session: session },
        response:
          "Which role — mentor, sponsor, coach, or connector? You can also say something like \"I'd like Dr. Wang to coach me on research design.\"",
        suggested_actions: [],
        complete: false,
      };
    }

    const nameMatch = trimmed.match(/dr\.?\s+[\w.-]+/i);
    if (nameMatch) {
      const person = nameMatch[0]!.replace(/\s+/g, " ");
      return {
        meta: {
          ...input.meta,
          board_building_session: {
            ...session,
            step: "relationship",
            role,
            person_name: person,
          },
        },
        response: `Is **${person}** someone you already have a relationship with, or would you like help connecting?`,
        suggested_actions: [],
        complete: false,
      };
    }

    return {
      meta: {
        ...input.meta,
        board_building_session: { ...session, step: "person_name", role },
      },
      response: `Who are you considering for **${BOARD_ROLE_LABELS[role].toLowerCase()}**? A name is enough for now.`,
      suggested_actions: [],
      complete: false,
    };
  }

  if (session.step === "person_name" && session.role) {
    const person = trimmed.replace(/^dr\.?\s*/i, "Dr. ").trim();
    return {
      meta: {
        ...input.meta,
        board_building_session: {
          ...session,
          step: "relationship",
          person_name: person,
        },
      },
      response: `Is **${person}** someone you already know, or would you like help connecting?`,
      suggested_actions: [],
      complete: false,
    };
  }

  if (session.step === "relationship" && session.role && session.person_name) {
    const strength = parseRelationshipStrength(trimmed);
    if (strength === "none" || /help connect|don't know|do not know|no/i.test(trimmed)) {
      return {
        meta: {
          ...input.meta,
          board_building_session: { ...session, step: "sourcing", relationship: "none" },
        },
        response: buildBoardSourcingMenu({
          personName: session.person_name,
          role: session.role,
          institution: input.institution,
          specialty: input.specialty,
        }),
        suggested_actions: [],
        complete: false,
      };
    }

    if (strength === "weak") {
      const member = {
        id: crypto.randomUUID(),
        role: session.role,
        name: session.person_name,
        status: "potential" as const,
        relationship_strength: "weak" as const,
        notes: "Weak tie — connector pathway may help warm the introduction",
        captured_at: new Date().toISOString(),
      };
      const board = mergeBoardSnapshot(input.meta, [member]);
      const cleared = clearBoardBuildingSession(input.meta);
      return {
        meta: { ...cleared, career_board: board },
        response: `A light connection can still be valuable — weak ties often open new doors.

What's one low-stakes step you could take — a brief note referencing where you met, or asking a mutual contact for an introduction?`,
        suggested_actions: [
          { action: "Draft outreach note", url: "" },
          { action: "Review goals", url: "/app/plan" },
        ],
        complete: true,
      };
    }

    const member = {
      id: crypto.randomUUID(),
      role: session.role,
      name: session.person_name,
      status: "active" as const,
      relationship_strength: "strong" as const,
      captured_at: new Date().toISOString(),
    };
    const board = mergeBoardSnapshot(input.meta, [member]);
    const cleared = clearBoardBuildingSession(input.meta);
    return {
      meta: { ...cleared, career_board: board },
      response: `Good — an existing relationship is the fastest path.

What's one concrete, bounded ask you could make of **${session.person_name}** as your ${BOARD_ROLE_LABELS[session.role].toLowerCase()} this quarter?`,
      suggested_actions: [
        { action: "Link to a goal", url: "/app/plan" },
        { action: "Build another role", url: "" },
      ],
      complete: true,
    };
  }

  if (session.step === "sourcing" && session.role && session.person_name) {
    const path = parseSourcingPath(trimmed) ?? "cold_outreach";
    const member = {
      id: crypto.randomUUID(),
      role: session.role,
      name: session.person_name,
      status: "potential" as const,
      relationship_strength: "none" as const,
      sourcing_path: path,
      captured_at: new Date().toISOString(),
    };
    const board = mergeBoardSnapshot(input.meta, [member]);
    const cleared = clearBoardBuildingSession(input.meta);

    if (path === "cold_outreach") {
      return {
        meta: { ...cleared, career_board: board },
        response: buildColdOutreachGuidance({
          personName: session.person_name,
          role: session.role,
        }),
        suggested_actions: [
          { action: "Draft outreach note", url: "" },
          { action: "Review Board gaps", url: "/app/plan" },
        ],
        complete: true,
      };
    }

    return {
      meta: { ...cleared, career_board: board },
      response: `Good choice — ${path.replace(/_/g, " ")} is often the right path for a ${BOARD_ROLE_LABELS[session.role].toLowerCase()} relationship.

What's one step you could take this month toward that introduction or program?`,
      suggested_actions: [
        { action: "Set a goal with Mak", url: "/app/plan" },
        { action: "Build another role", url: "" },
      ],
      complete: true,
    };
  }

  return {
    meta: input.meta,
    response: "Which Board role do you want to work on — mentor, sponsor, coach, or connector?",
    suggested_actions: [],
    complete: false,
  };
}

export function buildBoardAwarenessMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.board_awareness_session;
  if (!session) return "";
  const role = BOARD_ROLE_ORDER[session.step_index];
  return `Board awareness session — step ${session.step_index + 1}/${BOARD_ROLE_ORDER.length}.
Educate briefly on four roles (mentor ≠ sponsor). Ask who fills each role or "gap".
Current: ${role ? BOARD_ROLE_LABELS[role] : "complete"}.
Never cite study names. Mak is interim Board support only — not a permanent sponsor.`;
}

export function buildBoardBuildingMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.board_building_session;
  if (!session) return "";
  return `Board building session — step: ${session.step}.
If physician names someone unknown: ask relationship, then offer sourcing (cold outreach draft, warm intro, society program, institutional program, conference).
Distinguish mentor (advice/identity), sponsor (advocacy/power), coach (skill), connector (network bridges).`;
}
