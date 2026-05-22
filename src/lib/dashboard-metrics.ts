import { DOMAINS, TRACKS, type LatticeCellState } from "@/lib/constants";
import type { ActivityEntry } from "@/lib/types/database";
import type { CareerGoal } from "@/lib/goals";
import { activitiesToLatticeCells } from "@/lib/lattice";

export type CountEntry = { name: string; count: number };

export type CellHighlight = {
  domain: string;
  track: string;
  activityCount: number;
  signalPct: number;
};

export type DashboardMetrics = {
  updatedAt: string;
  subjective: {
    energyAverage: number;
    energyTrend: number;
    history: { date: string; level: number; label: string }[];
    mostEnergizing: CellHighlight | null;
    mostDraining: CellHighlight | null;
  };
  objective: {
    total: number;
    weekCount: number;
    domains: CountEntry[];
    tracks: CountEntry[];
    latticeCells: LatticeCellState[];
  };
  assessment: {
    careerPattern: string;
    recognitionGapPct: number;
    invisibleCount: number;
    alignmentPct: number;
    coherenceScore: number;
  };
  plan: {
    nextActions: CareerGoal[];
    suggestedOutput: { templateId: string; title: string; reason: string };
    checkInDaysAgo: number;
    checkInOverdue: boolean;
  };
};

function countByField(
  activities: ActivityEntry[],
  field: "primary_domain" | "primary_track",
): CountEntry[] {
  const map = new Map<string, number>();
  for (const a of activities) {
    const value = a[field];
    if (!value) continue;
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function isInvisible(a: ActivityEntry): boolean {
  const visibility = (a as ActivityEntry & { visibility_status?: string })
    .visibility_status;
  if (visibility) {
    return !["cv_ready", "documented"].includes(visibility);
  }
  return a.evidence_strength !== "documented";
}

function cellKey(domain: string | null, track: string | null): string | null {
  if (!domain || !track) return null;
  return `${domain}|${track}`;
}

function computeCellHighlights(
  activities: ActivityEntry[],
): { energizing: CellHighlight | null; draining: CellHighlight | null } {
  const map = new Map<
    string,
    { domain: string; track: string; count: number; energizing: number; draining: number }
  >();

  for (const a of activities) {
    const key = cellKey(a.primary_domain, a.primary_track);
    if (!key) continue;
    const cur = map.get(key) ?? {
      domain: a.primary_domain!,
      track: a.primary_track!,
      count: 0,
      energizing: 0,
      draining: 0,
    };
    cur.count += 1;
    if (a.energy_valence?.includes("energiz")) cur.energizing += 1;
    if (a.energy_valence?.includes("drain")) cur.draining += 1;
    map.set(key, cur);
  }

  let bestE: CellHighlight | null = null;
  let bestD: CellHighlight | null = null;

  for (const cell of map.values()) {
    if (cell.energizing > 0) {
      const pct = Math.round((cell.energizing / cell.count) * 100);
      if (
        !bestE ||
        cell.energizing > (bestE.activityCount * bestE.signalPct) / 100 ||
        (cell.energizing >= bestE.activityCount && pct > bestE.signalPct)
      ) {
        bestE = {
          domain: cell.domain,
          track: cell.track,
          activityCount: cell.count,
          signalPct: pct,
        };
      }
    }
    if (cell.draining > 0) {
      const pct = Math.round((cell.draining / cell.count) * 100);
      if (
        !bestD ||
        cell.draining > (bestD.activityCount * bestD.signalPct) / 100 ||
        (cell.draining >= bestD.activityCount && pct > bestD.signalPct)
      ) {
        bestD = {
          domain: cell.domain,
          track: cell.track,
          activityCount: cell.count,
          signalPct: pct,
        };
      }
    }
  }

  return { energizing: bestE, draining: bestD };
}

export function deriveCareerPattern(activities: ActivityEntry[]): string {
  const tracks = countByField(activities, "primary_track");
  const domains = countByField(activities, "primary_domain");

  if (tracks.length === 0) {
    return "Building your career pattern";
  }

  const shortTrack = (name: string) => name.split("/")[0].trim();
  const primary = shortTrack(tracks[0].name);
  const secondary = tracks[1] ? shortTrack(tracks[1].name) : null;

  const leadershipSignal = domains.some(
    (d) =>
      d.name.includes("Leadership") ||
      d.name.includes("Systems") ||
      tracks.some((t) => t.name.includes("Leader") || t.name.includes("Innovator")),
  );

  if (secondary && secondary !== primary) {
    const base = `${primary}-${secondary}`;
    return leadershipSignal
      ? `${base} with Emerging Systems Leadership`
      : base;
  }

  return leadershipSignal
    ? `${primary} with Emerging Systems Leadership`
    : `${primary} Focus`;
}

export function computeCoherenceScore(cells: LatticeCellState[]): number {
  const active = cells.filter((c) => c.activityCount > 0);
  if (active.length === 0) return 0;

  const total = active.reduce((s, c) => s + c.activityCount, 0);
  const shares = active.map((c) => c.activityCount / total);
  const hhi = shares.reduce((s, p) => s + p * p, 0);
  const maxHhi = 1;
  const minHhi = 1 / active.length;
  const concentration =
    maxHhi === minHhi ? 1 : (hhi - minHhi) / (maxHhi - minHhi);

  const energizingCells = active.filter((c) =>
    c.energy?.includes("energiz"),
  ).length;
  const energyRatio = energizingCells / active.length;

  return Math.round(Math.min(100, concentration * 55 + energyRatio * 45));
}

function computeAlignmentPct(activities: ActivityEntry[]): number {
  if (activities.length === 0) return 0;
  const energizing = activities.filter((a) =>
    a.energy_valence?.includes("energiz"),
  ).length;
  const documented = activities.filter(
    (a) => a.evidence_strength === "documented",
  ).length;
  const energyScore = (energizing / activities.length) * 70;
  const visibilityScore = (documented / activities.length) * 30;
  return Math.round(energyScore + visibilityScore);
}

function suggestOutput(
  activities: ActivityEntry[],
  goals: CareerGoal[],
  recognitionGapPct: number,
): DashboardMetrics["plan"]["suggestedOutput"] {
  const promotionGoal = goals.find(
    (g) =>
      g.status === "active" &&
      (g.goal_type?.includes("promotion") ||
        g.goal_title.toLowerCase().includes("promotion")),
  );

  if (promotionGoal) {
    return {
      templateId: "promotion_narrative",
      title: "Promotion Narrative",
      reason: `Active goal: ${promotionGoal.goal_title}. Strong evidence base to build your case.`,
    };
  }

  if (recognitionGapPct > 20 && activities.length >= 5) {
    return {
      templateId: "invisible_work_summary",
      title: "Invisible Work Summary",
      reason: `${recognitionGapPct}% of your work is hidden — document it before your next review.`,
    };
  }

  if (activities.length >= 10) {
    return {
      templateId: "annual_review",
      title: "Annual Review",
      reason: `You have ${activities.length} logged activities ready to synthesize.`,
    };
  }

  return {
    templateId: "career_snapshot",
    title: "Career Snapshot",
    reason: "Capture your current trajectory while patterns are emerging.",
  };
}

function last7DayHistory(
  history: { date: string; level: number }[],
): { date: string; level: number; label: string }[] {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const result: { date: string; level: number; label: string }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const entry = history.find((h) => h.date === iso);
    result.push({
      date: iso,
      level: entry?.level ?? 0,
      label: days[d.getDay()],
    });
  }

  return result;
}

export function computeDashboardMetrics(input: {
  activities: ActivityEntry[];
  energyHistory: { date: string; level: number }[];
  currentEnergy: number;
  goals: CareerGoal[];
  lastCheckInAt: string;
}): DashboardMetrics {
  const { activities, energyHistory, currentEnergy, goals, lastCheckInAt } =
    input;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCount = activities.filter(
    (a) => a.activity_date && new Date(a.activity_date) >= weekAgo,
  ).length;

  const history7 = last7DayHistory(energyHistory);
  const loggedLevels = history7.filter((h) => h.level > 0);
  const energyAverage =
    loggedLevels.length > 0
      ? Math.round(
          (loggedLevels.reduce((s, h) => s + h.level, 0) / loggedLevels.length) *
            10,
        ) / 10
      : currentEnergy;

  const energyTrend =
    loggedLevels.length >= 2
      ? loggedLevels[loggedLevels.length - 1].level -
        loggedLevels[loggedLevels.length - 2].level
      : 0;

  const invisibleCount = activities.filter(isInvisible).length;
  const recognitionGapPct =
    activities.length > 0
      ? Math.round((invisibleCount / activities.length) * 100)
      : 0;

  const latticeCells = activitiesToLatticeCells(activities);
  const cellHighlights = computeCellHighlights(activities);

  const checkInDate = new Date(lastCheckInAt);
  const checkInDaysAgo = Math.floor(
    (Date.now() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    updatedAt: new Date().toISOString(),
    subjective: {
      energyAverage,
      energyTrend,
      history: history7,
      mostEnergizing: cellHighlights.energizing,
      mostDraining: cellHighlights.draining,
    },
    objective: {
      total: activities.length,
      weekCount,
      domains: countByField(activities, "primary_domain").slice(0, 5),
      tracks: countByField(activities, "primary_track").slice(0, 5),
      latticeCells,
    },
    assessment: {
      careerPattern: deriveCareerPattern(activities),
      recognitionGapPct,
      invisibleCount,
      alignmentPct: computeAlignmentPct(activities),
      coherenceScore: computeCoherenceScore(latticeCells),
    },
    plan: {
      nextActions: goals
        .filter((g) => g.status === "active")
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3),
      suggestedOutput: suggestOutput(activities, goals, recognitionGapPct),
      checkInDaysAgo,
      checkInOverdue: checkInDaysAgo >= 21,
    },
  };
}

export function shortDomainLabel(domain: string): string {
  return domain.split(" ")[0];
}

export function shortTrackLabel(track: string): string {
  return track.split("/")[0];
}

export function energyLevelColor(level: number): string {
  if (level >= 7) return "text-fiscmak-green";
  if (level >= 5) return "text-fiscmak-amber";
  return "text-fiscmak-red";
}

export function gapBarColor(pct: number): string {
  if (pct > 50) return "bg-fiscmak-red";
  if (pct > 25) return "bg-fiscmak-amber";
  return "bg-fiscmak-green";
}

export function alignmentBarColor(pct: number): string {
  if (pct >= 70) return "bg-fiscmak-green";
  if (pct >= 50) return "bg-fiscmak-amber";
  return "bg-fiscmak-red";
}

export function coherenceLabel(score: number): string {
  if (score >= 80) return "Highly coherent";
  if (score >= 60) return "Coherent";
  if (score >= 40) return "Somewhat scattered";
  return "Very scattered";
}
