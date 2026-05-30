import type { ActivityEntry } from "@/lib/types/database";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { isConfirmedForEvidence } from "@/lib/v2/activity-confirm";
import { reconciliationItemsDetailed } from "@/lib/v2/reconcile-mak-helpers";
import type { LatticeDashboardResponse } from "@/lib/v2/lattice/types";

/** Single confirmed fact for Output Studio generation or Mak context. */
export type ConfirmedEvidenceItem = {
  evidence_id: string;
  source: "activity" | "cv" | "check_in" | "schedule" | "goal";
  sourceLabel: string;
  text: string;
  when: string | null;
};

const MAX_LATTICE_SNIPPETS = 12;
const SNIPPET_LIMIT = 120;

function truncate(text: string, max = SNIPPET_LIMIT): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export function confirmedReconciliationEvidence(
  meta: OnboardingMetadata,
): ConfirmedEvidenceItem[] {
  return reconciliationItemsDetailed(meta)
    .filter((item) => item.status === "confirmed")
    .map((item) => ({
      evidence_id: `recon-${item.id}`,
      source: "cv" as const,
      sourceLabel: item.source,
      text: item.detail ? `${item.label}: ${item.detail}` : item.label,
      when: null,
    }));
}

export function activitiesToConfirmedEvidence(
  activities: ActivityEntry[],
): ConfirmedEvidenceItem[] {
  return activities
    .filter(isConfirmedForEvidence)
    .filter((a) => (a.raw_text ?? "").trim().length > 0)
    .map((a) => ({
      evidence_id: a.id,
      source: "activity" as const,
      sourceLabel: a.input_source === "chat" ? "Mak capture" : "Activity log",
      text: a.raw_text!.trim(),
      when: a.activity_date ?? a.created_at?.slice(0, 10) ?? null,
    }));
}

export function checkInSummaryEvidence(meta: OnboardingMetadata): ConfirmedEvidenceItem[] {
  const items: ConfirmedEvidenceItem[] = [];
  const quarterly = meta.last_quarterly_summary?.trim();
  if (quarterly) {
    items.push({
      evidence_id: "checkin-quarterly-latest",
      source: "check_in",
      sourceLabel: "Quarterly check-in summary",
      text: quarterly,
      when: meta.pulse_history?.[0]?.completed_at?.slice(0, 10) ?? null,
    });
  }
  const lastPulse = meta.pulse_history?.[0];
  if (lastPulse?.summary?.trim()) {
    items.push({
      evidence_id: `checkin-pulse-${lastPulse.quarter}`,
      source: "check_in",
      sourceLabel: `${lastPulse.quarter} check-in`,
      text: lastPulse.summary.trim(),
      when: lastPulse.completed_at.slice(0, 10),
    });
  }
  if (meta.checkin_summary_confirmed_at && meta.career_health_summary?.trim()) {
    items.push({
      evidence_id: "checkin-baseline-summary",
      source: "check_in",
      sourceLabel: "Baseline check-in summary",
      text: meta.career_health_summary.trim(),
      when: meta.checkin_summary_confirmed_at.slice(0, 10),
    });
  }
  return items;
}

function latticeToConfirmedEvidence(
  dashboard: LatticeDashboardResponse | null,
): ConfirmedEvidenceItem[] {
  if (!dashboard?.evidence_total) return [];
  const out: ConfirmedEvidenceItem[] = [];
  for (const cell of dashboard.fiscmak.cells) {
    for (const e of cell.evidence) {
      if (out.length >= MAX_LATTICE_SNIPPETS) return out;
      if (!e.rawText.trim()) continue;
      out.push({
        evidence_id: e.id,
        source:
          e.source === "schedule" || e.source === "rotation"
            ? "schedule"
            : e.source === "goal"
              ? "goal"
              : e.source === "activity"
                ? "activity"
                : "cv",
        sourceLabel: e.sourceLabel,
        text: truncate(e.rawText),
        when: e.date,
      });
    }
  }
  return out;
}

export function buildConfirmedEvidenceList(input: {
  meta: OnboardingMetadata;
  activities?: ActivityEntry[];
  latticeDashboard?: LatticeDashboardResponse | null;
}): ConfirmedEvidenceItem[] {
  const seen = new Set<string>();
  const merged: ConfirmedEvidenceItem[] = [];

  const push = (item: ConfirmedEvidenceItem) => {
    const key = `${item.evidence_id}:${item.text.slice(0, 40)}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  };

  for (const item of confirmedReconciliationEvidence(input.meta)) push(item);
  for (const item of activitiesToConfirmedEvidence(input.activities ?? [])) push(item);
  for (const item of checkInSummaryEvidence(input.meta)) push(item);
  for (const item of latticeToConfirmedEvidence(input.latticeDashboard ?? null)) push(item);

  return merged;
}

export function formatConfirmedEvidenceForPrompt(items: ConfirmedEvidenceItem[]): string {
  if (!items.length) {
    return "No confirmed evidence on file yet — use only facts the physician confirms in this session.";
  }
  return items
    .map((item) => {
      const when = item.when ? ` · ${item.when}` : "";
      return `[${item.evidence_id}] (${item.sourceLabel}${when}) ${truncate(item.text, 160)}`;
    })
    .join("\n");
}

/** Concise bullet summary for Mak system context — confirmed facts only. */
export function buildConfirmedEvidenceMakSummary(items: ConfirmedEvidenceItem[]): string {
  if (!items.length) return "";
  const lines = [
    "Confirmed career evidence (cite evidence_id in document drafts; never invent beyond this list):",
    ...items.slice(0, 8).map((item) => {
      const when = item.when ? ` (${item.when})` : "";
      return `• [${item.evidence_id}] ${item.sourceLabel}${when}: ${truncate(item.text, 90)}`;
    }),
  ];
  if (items.length > 8) {
    lines.push(`• …and ${items.length - 8} more confirmed items`);
  }
  return lines.join("\n");
}
