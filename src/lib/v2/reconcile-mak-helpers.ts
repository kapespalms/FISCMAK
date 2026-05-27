import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { ReconciliationItem } from "@/lib/v2/onboarding-touchpoint1";
import { isNpiReconcileId } from "@/lib/v2/npi-registry";

function isBlockingPending(meta: OnboardingMetadata, id: string, status: string): boolean {
  if (status !== "pending") return false;
  if (meta.npi_verification_deferred && isNpiReconcileId(id)) return false;
  return true;
}

export function pendingReconciliationCount(meta: OnboardingMetadata): number {
  const snapshotItems = meta.enrichment_snapshot?.reconciliation_items ?? [];
  const statusMap = new Map((meta.reconciliation ?? []).map((r) => [r.id, r.status]));
  const ids = new Set([
    ...(meta.reconciliation ?? []).map((r) => r.id),
    ...snapshotItems.map((item) => item.id),
  ]);

  let count = 0;
  for (const id of ids) {
    const status = statusMap.get(id) ?? "pending";
    if (isBlockingPending(meta, id, status)) count += 1;
  }
  return count;
}

export function reconcileComplete(meta: OnboardingMetadata): boolean {
  return pendingReconciliationCount(meta) === 0;
}

export function reconciliationItemsDetailed(meta: OnboardingMetadata): ReconciliationItem[] {
  const snapshotItems = meta.enrichment_snapshot?.reconciliation_items ?? [];
  const statusMap = new Map((meta.reconciliation ?? []).map((r) => [r.id, r.status]));
  if (snapshotItems.length > 0) {
    return snapshotItems.map((item) => ({
      ...item,
      status: (statusMap.get(item.id) as ReconciliationItem["status"]) ?? item.status,
    }));
  }
  return (meta.reconciliation ?? []).map((r) => ({
    id: r.id,
    source: "Career Data",
    label: r.id,
    detail: "",
    status: r.status as ReconciliationItem["status"],
  }));
}

export function nextPendingItem(meta: OnboardingMetadata): ReconciliationItem | null {
  return reconciliationItemsDetailed(meta).find((i) => i.status === "pending") ?? null;
}

export function buildReconcileGreeting(meta: OnboardingMetadata): string {
  const pending = pendingReconciliationCount(meta);
  const next = nextPendingItem(meta);
  if (pending === 0 || !next) {
    return "Your Career Data looks reconciled. Ready to continue with your self-assessment?";
  }
  return `I found ${pending} item${pending > 1 ? "s" : ""} to confirm from your CV and public databases.\n\nFirst up — ${next.label} (${next.source}): ${next.detail}\n\nIs this yours? Reply yes to confirm or no to dismiss.`;
}

export function buildReconcileMakSystemContext(meta: OnboardingMetadata): string {
  const pending = pendingReconciliationCount(meta);
  const next = nextPendingItem(meta);
  if (!next) return "Reconciliation complete.";
  return `Onboarding reconcile: ${pending} pending. Current item: ${next.label} from ${next.source}. Accept yes/mine or no/not mine. One item at a time.`;
}

function parseReconcileIntent(message: string): "confirm" | "reject" | "unknown" {
  const m = message.trim().toLowerCase();
  if (/^(yes|y|mine|confirm|correct|that's mine|thats mine|accept)/.test(m)) return "confirm";
  if (/^(no|n|not mine|reject|skip|dismiss|incorrect|not me)/.test(m)) return "reject";
  return "unknown";
}

export type ReconcileTurnResult = {
  captured: boolean;
  complete: boolean;
  pendingCount: number;
  resolvedLabel?: string;
  nextPrompt?: string;
};

export function previewReconcileTurn(
  meta: OnboardingMetadata,
  message: string,
): ReconcileTurnResult {
  const next = nextPendingItem(meta);
  if (!next) {
    return { captured: false, complete: true, pendingCount: 0 };
  }
  const intent = parseReconcileIntent(message);
  if (intent === "unknown") {
    return {
      captured: false,
      complete: false,
      pendingCount: pendingReconciliationCount(meta),
      nextPrompt: `For "${next.label}" — reply yes if it's yours, or no to dismiss.`,
    };
  }
  const status = intent === "confirm" ? "confirmed" : "rejected";
  const reconciliation = (meta.reconciliation ?? []).map((r) =>
    r.id === next.id ? { ...r, status } : r,
  );
  const hasEntry = reconciliation.some((r) => r.id === next.id);
  const updatedReconciliation = hasEntry
    ? reconciliation
    : [...reconciliation, { id: next.id, status }];
  const updatedMeta: OnboardingMetadata = { ...meta, reconciliation: updatedReconciliation };
  const complete = reconcileComplete(updatedMeta);
  const remaining = pendingReconciliationCount(updatedMeta);
  const upcoming = nextPendingItem(updatedMeta);
  return {
    captured: true,
    complete,
    pendingCount: remaining,
    resolvedLabel: next.label,
    nextPrompt: complete
      ? "All set — your Career Data is reconciled. Let's move to your self-assessment next."
      : upcoming
        ? `Got it. Next — ${upcoming.label} (${upcoming.source}): ${upcoming.detail}\n\nIs this yours?`
        : undefined,
  };
}
