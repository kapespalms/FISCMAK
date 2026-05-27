import { DOMAINS, TRACKS, type EnergyValue, type LatticeCellState } from "@/lib/constants";
import type { CareerGoal } from "@/lib/goals";
import { activitiesToLatticeCells } from "@/lib/lattice";
import { computeGoalProgressWithHistory } from "@/lib/v2/goal-milestone-tracking";
import type { ActivityEntry } from "@/lib/types/database";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import type { CvEvidence } from "@/lib/v2/cv-metrics";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  apiEnrichmentPlan,
  buildReconciliationCandidates,
} from "@/lib/v2/onboarding-touchpoint1";
import type { PracticeSetting } from "@/lib/v2/onboarding-options";
import type { AppUser, DocumentRecord } from "@/lib/v2/types";
import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";
import { enrichmentVaultLine } from "@/lib/v2/api-enrichment";

export type DocumentFreshness = "current" | "needs_update" | "stale";

export type DashboardDocumentCard = {
  type: string;
  title: string;
  freshness: DocumentFreshness;
  detail: string;
  actionLabel?: string;
};

export type DashboardLatticeCell = LatticeCellState & {
  score?: number | null;
};

export type MetricHistorySeries = {
  fulfillment: number[];
  strain: number[];
  alignment: number[];
  task_alignment: number[];
};

export type ObjectiveBandSummary = {
  vaultSummary: string;
  changesSinceQuarter: string | null;
  pendingReviewCount: number;
  newItemCount: number;
  certificationAlert: string | null;
};

const DOMAIN_TRACK_SCORES: Array<{ domainIndex: number; trackIndex: number; keys: string[] }> = [
  { domainIndex: 0, trackIndex: 0, keys: ["clinical", "clinical_volume", "clinical_maintenance"] },
  { domainIndex: 1, trackIndex: 0, keys: ["communication", "clinical"] },
  { domainIndex: 2, trackIndex: 0, keys: ["professionalism", "wellbeing"] },
  { domainIndex: 3, trackIndex: 3, keys: ["systems", "service", "leadership"] },
  { domainIndex: 4, trackIndex: 2, keys: ["scholarship", "research", "teaching"] },
  { domainIndex: 5, trackIndex: 1, keys: ["collaboration", "mentoring", "teaching"] },
  { domainIndex: 6, trackIndex: 3, keys: ["leadership", "service"] },
  { domainIndex: 7, trackIndex: 7, keys: ["wellbeing", "growth", "professional_growth"] },
  { domainIndex: 4, trackIndex: 2, keys: ["research_influence", "innovation"] },
  { domainIndex: 0, trackIndex: 5, keys: ["innovation", "quality"] },
  { domainIndex: 3, trackIndex: 4, keys: ["advocacy", "network"] },
  { domainIndex: 0, trackIndex: 6, keys: ["quality", "quality_outcomes"] },
];

export function sparklineTrend(values: number[]): "up" | "flat" | "down" {
  if (values.length < 2) return "flat";
  const delta = values[values.length - 1] - values[values.length - 2];
  if (delta > 2) return "up";
  if (delta < -2) return "down";
  return "flat";
}

export function buildMetricHistory(
  meta: OnboardingMetadata,
  current: {
    fulfillment?: number;
    strain?: number;
    alignment?: number;
    taskAlignment?: number;
  },
): MetricHistorySeries {
  const quarters = [...(meta.pulse_history ?? [])].reverse().slice(-4);

  const fromPulse = {
    fulfillment: quarters
      .map((q) => (q.track_energy != null ? Math.round(q.track_energy * 20) : null))
      .filter((v): v is number => v != null),
    strain: quarters
      .map((q) =>
        q.burnout_screen != null ? Math.max(0, Math.round(100 - q.burnout_screen * 20)) : null,
      )
      .filter((v): v is number => v != null),
    alignment: (meta.alignment_history ?? [])
      .slice()
      .reverse()
      .map((e) => e.alignment_pct)
      .concat(
        quarters
          .map((q) => q.career_health_score ?? null)
          .filter((v): v is number => v != null),
      )
      .slice(-4),
    task_alignment: quarters
      .map((q) =>
        q.invisible_hours != null ? Math.max(0, Math.round(100 - q.invisible_hours * 5)) : null,
      )
      .filter((v): v is number => v != null),
  };

  return {
    fulfillment: padSeries(fromPulse.fulfillment, current.fulfillment),
    strain: padSeries(fromPulse.strain, current.strain),
    alignment: padSeries(fromPulse.alignment, current.alignment),
    task_alignment: padSeries(fromPulse.task_alignment, current.taskAlignment),
  };
}

function padSeries(values: number[], current?: number): number[] {
  if (values.length >= 2) return values.slice(-4);
  if (current != null && values.length === 1) return [values[0], current];
  if (current != null) return [current];
  return values;
}

export function buildVaultSummary(
  setting: PracticeSetting | null,
  evidence: CvEvidence | null,
  cvAvailable: boolean,
  enrichment?: EnrichmentSnapshot | null,
): string {
  if (!cvAvailable || !evidence) return "Upload documents to populate Career Vault";
  const enriched = enrichmentVaultLine(setting, enrichment);
  if (enriched) return enriched;

  if (setting === "Community") {
    return `${evidence.clinical_signals} clinical signals · ${evidence.qi_signals} quality metrics · ${Math.max(1, evidence.leadership_roles)} certifications · ${evidence.publication_signals} presentations`;
  }
  if (setting === "Industry") {
    return `${evidence.publication_signals} therapeutic publications · ${evidence.leadership_roles} advisory boards · ${evidence.qi_signals} regulatory contributions`;
  }
  const grants = Math.max(1, Math.min(5, Math.floor(evidence.publication_signals / 8)));
  return `${evidence.publication_signals} publications · ${grants} active grants · ${evidence.teaching_signals} courses · ${evidence.committee_roles} committees · ${evidence.publication_signals} presentations · ${Math.max(1, evidence.mentoring_mentions)} awards`;
}

export function buildObjectiveSummary(input: {
  user: AppUser;
  meta: OnboardingMetadata;
  cvText?: string | null;
  evidence: CvEvidence | null;
  cvAvailable: boolean;
  setting: PracticeSetting | null;
  enrichment?: EnrichmentSnapshot | null;
}): ObjectiveBandSummary {
  const plan = apiEnrichmentPlan(input.user.practice_setting, input.user.career_stage);
  const candidates = buildReconciliationCandidates({
    cvText: input.cvText,
    specialty: input.user.specialty,
    enrichmentPlan: plan,
  });
  const enrichmentItems = input.enrichment?.reconciliation_items ?? [];
  const allItems = [...enrichmentItems, ...candidates];
  const statusMap = new Map(
    (input.meta.reconciliation ?? []).map((r) => [r.id, r.status]),
  );
  const pendingReviewCount = allItems.filter(
    (c) => (statusMap.get(c.id) ?? c.status) === "pending",
  ).length;

  const history = input.meta.pulse_history ?? [];
  const last = history[0];
  const prev = history[1];
  const changeParts: string[] = [];

  if (input.enrichment?.changes_summary) {
    return {
      vaultSummary: buildVaultSummary(
        input.setting,
        input.evidence,
        input.cvAvailable,
        input.enrichment,
      ),
      changesSinceQuarter: input.enrichment.changes_summary,
      pendingReviewCount,
      newItemCount: pendingReviewCount,
      certificationAlert: buildCertAlert(input),
    };
  }

  if (last?.career_health_score != null && prev?.career_health_score != null) {
    const delta = last.career_health_score - prev.career_health_score;
    if (delta !== 0) changeParts.push(`${delta > 0 ? "+" : ""}${delta} Career Health Score points`);
  }
  if (input.enrichment?.publications_detected) {
    changeParts.push(`+${input.enrichment.publications_detected} publications verified`);
  } else if (input.evidence?.publication_signals) {
    changeParts.push(`+${Math.min(3, input.evidence.publication_signals)} publications`);
  }
  if (input.enrichment?.citations_total != null) {
    changeParts.push(`${input.enrichment.citations_total} citations indexed`);
  }
  if (pendingReviewCount > 0) {
    changeParts.push(`+${pendingReviewCount} item${pendingReviewCount > 1 ? "s" : ""} pending review`);
  }

  const changesSinceQuarter =
    changeParts.length > 0 ? `${changeParts.join(", ")} since last quarter` : null;

  return {
    vaultSummary: buildVaultSummary(
      input.setting,
      input.evidence,
      input.cvAvailable,
      input.enrichment,
    ),
    changesSinceQuarter,
    pendingReviewCount,
    newItemCount: pendingReviewCount,
    certificationAlert: buildCertAlert(input),
  };
}

function buildCertAlert(input: {
  setting: PracticeSetting | null;
  cvAvailable: boolean;
  cvText?: string | null;
}): string | null {
  if (input.setting === "Community" && input.cvAvailable && input.cvText) {
    const lower = input.cvText.toLowerCase();
    if (/board certified|certification|recertif/.test(lower)) {
      return "Board certification expires in 8 months — recertification recommended";
    }
  }
  return null;
}

export function computeGoalProgress(goal: CareerGoal): { percent: number; stalled: boolean } {
  const result = computeGoalProgressWithHistory(goal, []);
  return { percent: result.percent, stalled: result.stalled };
}

export function documentFreshness(uploadedAt: string | null | undefined): DocumentFreshness {
  if (!uploadedAt) return "stale";
  const months = (Date.now() - new Date(uploadedAt).getTime()) / (30 * 86400000);
  if (months <= 3) return "current";
  if (months <= 6) return "needs_update";
  return "stale";
}

function formatQuarter(iso: string): string {
  const d = new Date(iso);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

export function buildDocumentCards(
  documents: DocumentRecord[],
  setting: PracticeSetting | null,
  primaryLabel: string,
  secondaryLabel: string,
): DashboardDocumentCard[] {
  const findDoc = (type: string) =>
    documents.find((d) => d.document_type === type || d.document_type.toLowerCase() === type.toLowerCase());

  const cv = findDoc("CV");
  const biosketch = findDoc("NIH_Biosketch");
  const cards: DashboardDocumentCard[] = [];

  if (cv) {
    const fresh = documentFreshness(cv.uploaded_at);
    cards.push({
      type: primaryLabel,
      title: primaryLabel,
      freshness: fresh,
      detail: `Last updated ${formatQuarter(cv.uploaded_at)}`,
      actionLabel: fresh !== "current" ? "Update Now" : undefined,
    });
  } else {
    cards.push({
      type: primaryLabel,
      title: primaryLabel,
      freshness: "stale",
      detail: "Upload to get started",
    });
  }

  if (biosketch || setting === "Academic" || setting === "Hybrid") {
    const doc = biosketch;
    cards.push({
      type: secondaryLabel,
      title: secondaryLabel,
      freshness: doc ? documentFreshness(doc.uploaded_at) : "needs_update",
      detail: doc
        ? `Auto-updated ${formatQuarter(doc.uploaded_at)}`
        : "Available after Career Data populated",
    });
  } else {
    cards.push({
      type: secondaryLabel,
      title: secondaryLabel,
      freshness: cv ? "needs_update" : "stale",
      detail: cv ? "Generate from Career Profile" : "Available after Career Data populated",
    });
  }

  cards.push({
    type: "Career Brief",
    title: "Career Brief",
    freshness: cv ? "needs_update" : "stale",
    detail: "Generate from Career Profile summary",
  });

  return cards.slice(0, 4);
}

function cellScoreFromHealth(
  domainIndex: number,
  trackIndex: number,
  health: CareerHealthView | null,
): number | null {
  if (!health?.domains?.length) return null;
  const mapping = DOMAIN_TRACK_SCORES.find(
    (m) => m.domainIndex === domainIndex && m.trackIndex === trackIndex,
  );
  if (!mapping) return null;
  const match = health.domains.find((d) =>
    mapping.keys.some((k) => d.key.includes(k) || d.label.toLowerCase().includes(k)),
  );
  return match?.score ?? null;
}

export function buildDashboardLattice(input: {
  activities: ActivityEntry[];
  health: CareerHealthView | null;
}): DashboardLatticeCell[] {
  const base = activitiesToLatticeCells(input.activities);
  return base.map((cell) => {
    const activityScore =
      cell.activityCount > 0
        ? Math.min(
            100,
            Math.max(
              20,
              40 +
                cell.activityCount * 8 +
                (cell.energy === "very_energizing"
                  ? 15
                  : cell.energy === "energizing"
                    ? 10
                    : cell.energy === "draining"
                      ? -10
                      : 0),
            ),
          )
        : null;
    const healthScore = cellScoreFromHealth(cell.domainIndex, cell.trackIndex, input.health);
    return {
      ...cell,
      score: activityScore ?? healthScore,
    };
  });
}

export function findGlowCell(cells: DashboardLatticeCell[]): { domainIndex: number; trackIndex: number } | null {
  let best: DashboardLatticeCell | null = null;
  for (const cell of cells) {
    if (cell.score == null) continue;
    if (!best || (best.score ?? 0) < cell.score) best = cell;
  }
  if (!best || best.score == null) return null;
  return { domainIndex: best.domainIndex, trackIndex: best.trackIndex };
}

export function formatLatticeStrength(cell: DashboardLatticeCell): string {
  const domain = DOMAINS[cell.domainIndex] ?? "Domain";
  const track = TRACKS[cell.trackIndex] ?? "Track";
  return `${domain} × ${track} (${cell.score ?? "—"})`;
}

export function advancementReadinessFromHealth(
  health: CareerHealthView | null,
  rank: string | null,
  setting: PracticeSetting | null,
): { met: number; total: number; label: string } | undefined {
  if (setting !== "Academic" && setting !== "Hybrid") return undefined;
  if (!health?.domains?.length) return undefined;
  const met = health.domains.filter((d) => d.score >= 60).length;
  const total = Math.min(6, Math.max(4, health.domains.length));
  return {
    met: Math.min(met, total),
    total,
    label: rank ?? "next rank",
  };
}

export type PulseHistoryEntry = NonNullable<OnboardingMetadata["pulse_history"]>[number];

export function extractPulseHistory(meta: OnboardingMetadata): PulseHistoryEntry[] {
  return meta.pulse_history ?? [];
}
