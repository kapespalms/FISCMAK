/**
 * Career Board of Directors — mentor, sponsor, coach, connector roles.
 * Evidence-informed: mentorship ≠ sponsorship; weak ties matter; Mak is interim only.
 */

import type { GoalFrameworkType } from "@/lib/v2/soap-tab-spec";

export type BoardRole = "mentor" | "sponsor" | "coach" | "connector";

export type BoardRelationshipStrength = "strong" | "weak" | "none";

export type BoardMemberStatus = "active" | "potential" | "gap";

export type BoardSourcingPath =
  | "institutional_program"
  | "professional_society"
  | "conference_workshop"
  | "board_referral"
  | "cold_outreach";

export type BoardMember = {
  id: string;
  role: BoardRole;
  name: string;
  institution?: string;
  specialty?: string;
  title?: string;
  status: BoardMemberStatus;
  relationship_strength?: BoardRelationshipStrength;
  /** Display label, e.g. "Ongoing", "Active" */
  relationship_label?: string;
  last_contact_at?: string;
  next_meeting_at?: string | null;
  recent_advocacy?: string;
  /** Coach-only: Research, Leadership, Clinical Skills, etc. */
  coach_domain?: string;
  /** Coach marked as self-directed learning */
  is_self_taught?: boolean;
  network_tags?: string[];
  connections_facilitated?: number;
  linked_goal_ids?: string[];
  notes?: string;
  sourcing_path?: BoardSourcingPath;
  captured_at: string;
};

export type CareerBoardSnapshot = {
  members: BoardMember[];
  gaps: BoardRole[];
  last_assessed_at?: string;
};

export type BoardRoleCardView = {
  name: string;
  specialty?: string;
  title?: string;
  relationship: string;
  lastContact?: string;
  nextMeeting?: string | null;
  recentAdvocacy?: string;
  network?: string;
  connectionsFacilitated?: number;
  status: BoardMemberStatus;
};

export type CoachSlotView = {
  domain: string;
  name?: string;
  status: "filled" | "searching" | "self_taught";
  relationship?: string;
};

export type BoardProfileView = {
  mentor: BoardRoleCardView | null;
  sponsor: BoardRoleCardView | null;
  coaches: CoachSlotView[];
  connector: BoardRoleCardView | null;
  gaps: BoardRole[];
  last_assessed_at?: string;
};

export const DEFAULT_COACH_DOMAINS = ["Research", "Leadership", "Clinical Skills"] as const;

export const BOARD_ROLE_LABELS: Record<BoardRole, string> = {
  mentor: "Mentor",
  sponsor: "Sponsor",
  coach: "Coach",
  connector: "Connector",
};

export const BOARD_ROLE_DEFINITIONS: Record<
  BoardRole,
  { summary: string; distinction: string }
> = {
  mentor: {
    summary: "Helps you think through decisions and shape career identity",
    distinction:
      "Trusted advisor who shares their path — critical for identity formation and satisfaction, especially early career.",
  },
  sponsor: {
    summary: "Advocates for you in rooms you're not in",
    distinction:
      "Must have institutional power. Mentorship alone does not predict advancement — sponsorship does. Seek both.",
  },
  coach: {
    summary: "Teaches specific skills for a defined competency gap",
    distinction:
      "Domain-specific — research coaching ≠ leadership coaching. Match the coach to the skill, not a generic advisor.",
  },
  connector: {
    summary: "Opens doors and bridges networks — often through weak ties",
    distinction:
      "Acquaintances and peripheral contacts often unlock new opportunities more than your closest colleagues.",
  },
};

export const BOARD_ROLE_ORDER: BoardRole[] = ["mentor", "sponsor", "coach", "connector"];

export const GOAL_BOARD_PROMPTS: Record<GoalFrameworkType, string[]> = {
  development: [
    "**Coach:** Who can teach you the specific skill you need for this goal?",
    "**Sponsor:** Who has your back for opportunities when positions or projects open?",
  ],
  maintenance: [
    "**Mentor:** Is there someone who can help you think through whether protecting this strength is the right priority?",
  ],
  sustainability: [
    "**Mentor:** Who can help you think through sustainable workload and alignment choices?",
    "**Connector:** Who in your network opens doors — including people you know lightly, not just close colleagues?",
  ],
};

export const SOURCING_PATH_LABELS: Record<BoardSourcingPath, string> = {
  institutional_program: "Institutional mentorship or faculty development program",
  professional_society: "Specialty society mentorship program",
  conference_workshop: "Conference, workshop, or networking event",
  board_referral: "Introduction from someone already on your Board",
  cold_outreach: "Thoughtful cold outreach (Mak can help draft what to say)",
};

export function buildBoardAwarenessIntro(): string {
  return `Your **Career Board** is the small group of people who help you move — not a formal committee, but four distinct roles:

1. **Mentor** — helps you think through direction and identity
2. **Sponsor** — advocates for you when opportunities arise (needs institutional power)
3. **Coach** — teaches a specific skill you need now
4. **Connector** — opens doors and bridges networks

Mentor and sponsor are **not** the same — most physicians have mentors but lack sponsors.

I'll ask who currently fills each role for you (name, several names, or "gap"). I'm also here as interim support while you build real relationships — but I can't replace people in rooms where decisions happen.

Who serves as your **mentor** today — someone who helps you think through career direction?`;
}

export function buildBoardRolePrompt(
  role: BoardRole,
  partial: Partial<Record<BoardRole, string>>,
): string {
  const filled = BOARD_ROLE_ORDER.filter((r) => partial[r]?.trim() && partial[r] !== "gap");
  const prior =
    filled.length > 0
      ? `Noted${filled.map((r) => ` ${BOARD_ROLE_LABELS[r].toLowerCase()}: ${partial[r]}`).join(";")}. `
      : "";
  return `${prior}Who serves as your **${BOARD_ROLE_LABELS[role].toLowerCase()}** — ${BOARD_ROLE_DEFINITIONS[role].summary.toLowerCase()}? Name(s), or say "gap" if missing.`;
}

export function buildBoardGapSummary(
  roster: Partial<Record<BoardRole, string>>,
): { gaps: BoardRole[]; text: string } {
  const gaps = BOARD_ROLE_ORDER.filter((role) => {
    const val = roster[role]?.trim().toLowerCase();
    return !val || val === "gap" || val === "none" || val === "missing";
  });

  if (gaps.length === 0) {
    return {
      gaps: [],
      text: "You have names across all four roles — strong relational capital. Next we'll keep those relationships active and link them to your goals.",
    };
  }

  const gapList = gaps.map((r) => BOARD_ROLE_LABELS[r]).join(", ");
  return {
    gaps,
    text: `Gaps on your Board: **${gapList}**.

Remember — sponsor is often the hardest to find and the most impact on advancement. Want to start building one of these roles?`,
  };
}

export function rosterToBoardMembers(
  roster: Partial<Record<BoardRole, string>>,
): BoardMember[] {
  const now = new Date().toISOString();
  const members: BoardMember[] = [];

  for (const role of BOARD_ROLE_ORDER) {
    const raw = roster[role]?.trim();
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (lower === "gap" || lower === "none" || lower === "missing") continue;

    for (const name of raw.split(/[,;]+/).map((n) => n.trim()).filter(Boolean)) {
      members.push({
        id: crypto.randomUUID(),
        role,
        name,
        status: "active",
        relationship_strength: "strong",
        captured_at: now,
      });
    }
  }

  return members;
}

export function computeBoardGaps(members: BoardMember[]): BoardRole[] {
  const covered = new Set(members.filter((m) => m.status !== "gap").map((m) => m.role));
  return BOARD_ROLE_ORDER.filter((role) => !covered.has(role));
}

export function buildBoardSourcingMenu(input: {
  personName: string;
  role: BoardRole;
  institution?: string | null;
  specialty?: string | null;
}): string {
  const inst = input.institution?.trim() || "your institution";
  const society = input.specialty?.trim() || "your specialty society";
  return `For **${input.personName}** as a potential ${BOARD_ROLE_LABELS[input.role].toLowerCase()}, a few options:

1. **Cold outreach** — I can help you draft a concise, respectful note about what you're asking for
2. **Warm introduction** — Is there someone at ${inst} who could introduce you?
3. **Society program** — ${society} may run formal mentorship or career programs
4. **Institutional program** — faculty development, GME, or diversity/inclusion mentorship tracks at ${inst}
5. **Conference or workshop** — meet in a lower-stakes setting first

Which path do you want to explore?`;
}

export function buildColdOutreachGuidance(input: {
  personName: string;
  role: BoardRole;
  ask?: string;
}): string {
  const roleLabel = BOARD_ROLE_LABELS[input.role].toLowerCase();
  const ask =
    input.ask?.trim() ||
    `brief ${roleLabel} conversation about a specific goal you're working on`;
  return `Draft cold outreach frame for ${input.personName}:

- **Opening:** Reference something specific (their work, a talk, a mutual connection if any)
- **Credibility:** One sentence on who you are and your relevant context
- **Ask:** "${ask}" — concrete, bounded, respectful of their time (15–20 minutes)
- **Close:** Offer flexibility; no pressure

Keep it under 150 words. Would you like me to draft a note you can edit?`;
}

export function buildGoalBoardPrompt(
  goalType: GoalFrameworkType,
  board?: CareerBoardSnapshot | null,
): string {
  const prompts = GOAL_BOARD_PROMPTS[goalType];
  if (!prompts.length) return "";

  const gapHint =
    board?.gaps?.length && board.gaps.length > 0
      ? `\n_(Your Board is missing: ${board.gaps.map((g) => BOARD_ROLE_LABELS[g]).join(", ")})_`
      : "";

  return `\n\n**Board check** (real people, not me long-term):${gapHint}\n${prompts.map((p) => `- ${p}`).join("\n")}`;
}

export function buildCareerBoardSystemContext(board?: CareerBoardSnapshot | null): string {
  if (!board?.members?.length && !board?.gaps?.length) return "";

  const memberLines = board.members
    .map(
      (m) =>
        `- ${BOARD_ROLE_LABELS[m.role]}: ${m.name}${m.institution ? ` (${m.institution})` : ""} [${m.status}]`,
    )
    .join("\n");

  const gapLine =
    board.gaps.length > 0
      ? `Board gaps: ${board.gaps.map((g) => BOARD_ROLE_LABELS[g]).join(", ")}. Prioritize sponsor gap if present.`
      : "All four Board roles have at least one named person.";

  return `Career Board snapshot:
${memberLines || "- No members captured yet"}
${gapLine}
When setting goals, ask Board questions (mentor/sponsor/coach/connector) — match role to goal type.
If physician names someone they do not know: ask relationship status, then offer sourcing paths (institutional, society, conference, referral, cold outreach with draft help).
Mak interim role ONLY: coach conversations, identity narrative, resource connector. Mak does NOT sponsor, advocate institutionally, or replace permanent Board members. As Board grows, step back to supporting their human relationships.`;
}

export function buildMakInterimBoardContext(): string {
  return `Mak interim Board role (while physician builds real relationships):
- DO: career reflection, narrative construction, sourcing strategy, outreach drafts, pathway concepts
- DO NOT: claim to sponsor, advocate in their institution, or replace human mentors/sponsors/coaches
- Transition: as Board fills in, focus on "coaching the coach" — how to activate each relationship`;
}

export function parseBoardRole(text: string): BoardRole | undefined {
  const lower = text.toLowerCase();
  if (/mentor/.test(lower)) return "mentor";
  if (/sponsor/.test(lower)) return "sponsor";
  if (/coach/.test(lower)) return "coach";
  if (/connect/.test(lower)) return "connector";
  return undefined;
}

export function parseSourcingPath(text: string): BoardSourcingPath | undefined {
  const lower = text.toLowerCase();
  if (/^1\b|cold|outreach|email|reach out/.test(lower)) return "cold_outreach";
  if (/^2\b|intro|introduction|warm|connect me/.test(lower)) return "board_referral";
  if (/^3\b|society|association|professional/.test(lower)) return "professional_society";
  if (/^4\b|institut|program|gme|faculty development/.test(lower)) return "institutional_program";
  if (/^5\b|conference|workshop|network/.test(lower)) return "conference_workshop";
  return undefined;
}

export function parseRelationshipStrength(text: string): BoardRelationshipStrength {
  const lower = text.toLowerCase();
  if (/don't know|do not know|never met|no relationship|not know|cold|stranger/.test(lower)) {
    return "none";
  }
  if (/weak|acquaint|met once|briefly|conference|lightly/.test(lower)) return "weak";
  return "strong";
}

export function formatBoardLastContact(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 14) return "This month";
  if (days < 45) return "1 month ago";
  const months = Math.round(days / 30);
  return `${months} months ago`;
}

export function formatBoardNextMeeting(iso?: string | null): string | null | undefined {
  if (iso === null) return null;
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function relationshipLabel(member: BoardMember): string {
  if (member.relationship_label?.trim()) return member.relationship_label.trim();
  if (member.is_self_taught) return "Self-directed";
  if (member.status === "potential") return "Building";
  if (member.relationship_strength === "weak") return "Developing";
  if (member.role === "mentor") return "Ongoing";
  if (member.role === "sponsor") return "Active";
  return "Active";
}

function memberToRoleCard(member: BoardMember): BoardRoleCardView {
  const network =
    member.network_tags?.length ? member.network_tags.join(" + ") : undefined;
  return {
    name: member.name,
    specialty: member.specialty,
    title: member.title,
    relationship: relationshipLabel(member),
    lastContact: formatBoardLastContact(member.last_contact_at),
    nextMeeting: formatBoardNextMeeting(member.next_meeting_at),
    recentAdvocacy: member.recent_advocacy,
    network,
    connectionsFacilitated: member.connections_facilitated,
    status: member.status,
  };
}

function primaryMember(members: BoardMember[], role: BoardRole): BoardMember | undefined {
  const roleMembers = members.filter((m) => m.role === role && m.status !== "gap");
  return (
    roleMembers.find((m) => m.status === "active") ??
    roleMembers.find((m) => m.status === "potential") ??
    roleMembers[0]
  );
}

export function buildCoachSlots(members: BoardMember[]): CoachSlotView[] {
  const coaches = members.filter((m) => m.role === "coach");
  const slots: CoachSlotView[] = [];
  const used = new Set<string>();

  for (const domain of DEFAULT_COACH_DOMAINS) {
    const match = coaches.find(
      (c) =>
        c.coach_domain?.toLowerCase() === domain.toLowerCase() ||
        c.notes?.toLowerCase().includes(domain.toLowerCase()),
    );
    if (match) {
      used.add(match.id);
      slots.push({
        domain,
        name: match.is_self_taught ? undefined : match.name,
        status: match.is_self_taught ? "self_taught" : "filled",
        relationship: relationshipLabel(match),
      });
    } else {
      slots.push({ domain, status: "searching" });
    }
  }

  for (const coach of coaches) {
    if (used.has(coach.id)) continue;
    slots.push({
      domain: coach.coach_domain ?? "Coach",
      name: coach.is_self_taught ? undefined : coach.name,
      status: coach.is_self_taught ? "self_taught" : coach.status === "potential" ? "searching" : "filled",
      relationship: relationshipLabel(coach),
    });
  }

  return slots;
}

export function buildBoardProfileView(
  snapshot?: CareerBoardSnapshot | null,
): BoardProfileView | null {
  if (!snapshot?.members?.length) return null;

  const members = snapshot.members;
  const mentor = primaryMember(members, "mentor");
  const sponsor = primaryMember(members, "sponsor");
  const connector = primaryMember(members, "connector");

  return {
    mentor: mentor ? memberToRoleCard(mentor) : null,
    sponsor: sponsor ? memberToRoleCard(sponsor) : null,
    coaches: buildCoachSlots(members),
    connector: connector ? memberToRoleCard(connector) : null,
    gaps: snapshot.gaps?.length ? snapshot.gaps : computeBoardGaps(members),
    last_assessed_at: snapshot.last_assessed_at,
  };
}

export function demoCareerBoardSnapshot(): CareerBoardSnapshot {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(12);

  return {
    last_assessed_at: new Date().toISOString(),
    gaps: [],
    members: [
      {
        id: "demo-mentor",
        role: "mentor",
        name: "Dr. X",
        specialty: "Psychiatry",
        status: "active",
        relationship_label: "Ongoing",
        last_contact_at: twoMonthsAgo.toISOString(),
        next_meeting_at: nextMonth.toISOString(),
        captured_at: new Date().toISOString(),
      },
      {
        id: "demo-sponsor",
        role: "sponsor",
        name: "Dr. Y",
        title: "Department Chair",
        status: "active",
        relationship_label: "Active",
        recent_advocacy: "Nomination for regional conference speaker slot",
        captured_at: new Date().toISOString(),
      },
      {
        id: "demo-coach-research",
        role: "coach",
        name: "Dr. Z",
        coach_domain: "Research",
        status: "active",
        relationship_label: "Active",
        captured_at: new Date().toISOString(),
      },
      {
        id: "demo-coach-clinical",
        role: "coach",
        coach_domain: "Clinical Skills",
        is_self_taught: true,
        name: "Self-taught",
        status: "active",
        relationship_label: "Self-directed",
        captured_at: new Date().toISOString(),
      },
      {
        id: "demo-connector",
        role: "connector",
        name: "Dr. A",
        status: "active",
        network_tags: ["Psychiatry", "AI", "Digital Health"],
        connections_facilitated: 2,
        relationship_label: "Active",
        captured_at: new Date().toISOString(),
      },
    ],
  };
}
