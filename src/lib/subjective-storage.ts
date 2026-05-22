export type SubjectiveCheckIn = {
  energyLevel: number;
  triggers: string[];
  updatedAt: string;
};

export type BurnoutSnapshot = {
  emotionalExhaustion: number;
  depersonalization: number;
  reducedEfficacy: number;
};

const CHECKIN_KEY = "fiscmak_subjective_checkin";
const HISTORY_KEY = "fiscmak_energy_history";

export const MOOD_TRIGGERS = [
  "Energized by patient care",
  "Drained by admin",
  "Challenged by research",
  "Fulfilled by teaching",
  "Drained by difficult patients",
  "Energized by collaboration",
] as const;

export function loadSubjectiveCheckIn(): SubjectiveCheckIn {
  if (typeof window === "undefined") {
    return { energyLevel: 6, triggers: [], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    if (!raw) {
      return { energyLevel: 6, triggers: [], updatedAt: new Date().toISOString() };
    }
    return JSON.parse(raw) as SubjectiveCheckIn;
  } catch {
    return { energyLevel: 6, triggers: [], updatedAt: new Date().toISOString() };
  }
}

export function saveSubjectiveCheckIn(checkIn: SubjectiveCheckIn) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkIn));
  appendEnergyHistory(checkIn.energyLevel);
}

function appendEnergyHistory(level: number) {
  const today = new Date().toISOString().slice(0, 10);
  const history = loadEnergyHistory().filter((h) => h.date !== today);
  history.push({ date: today, level });
  const trimmed = history.slice(-7);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function loadEnergyHistory(): { date: string; level: number }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as { date: string; level: number }[]) : [];
  } catch {
    return [];
  }
}

export function computeBurnoutSignals(
  energyLevel: number,
  triggers: string[],
): BurnoutSnapshot {
  const drainingCount = triggers.filter((t) =>
    t.toLowerCase().includes("drain"),
  ).length;
  const lowEnergy = energyLevel <= 4 ? 0.35 : energyLevel <= 6 ? 0.15 : 0;

  return {
    emotionalExhaustion: Math.min(
      100,
      Math.round(30 + lowEnergy * 100 + drainingCount * 12),
    ),
    depersonalization: Math.min(100, Math.round(15 + drainingCount * 8)),
    reducedEfficacy: Math.min(
      100,
      Math.round(20 + (10 - energyLevel) * 4 + drainingCount * 5),
    ),
  };
}

export function burnoutAlertLevel(snapshot: BurnoutSnapshot): "green" | "amber" | "red" {
  const max = Math.max(
    snapshot.emotionalExhaustion,
    snapshot.depersonalization,
    snapshot.reducedEfficacy,
  );
  if (max > 50) return "red";
  if (max > 25) return "amber";
  return "green";
}
