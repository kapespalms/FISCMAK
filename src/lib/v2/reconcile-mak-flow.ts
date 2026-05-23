import type { AppUser } from "@/lib/v2/types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { upsertAppUser } from "@/lib/v2/api-helpers";
import { persistReconciliationStatuses } from "@/lib/v2/career-data-repo";
import {
  nextPendingItem,
  previewReconcileTurn,
  reconcileComplete,
  type ReconcileTurnResult,
} from "@/lib/v2/reconcile-mak-helpers";

export {
  buildReconcileGreeting,
  buildReconcileMakSystemContext,
  pendingReconciliationCount,
  reconcileComplete,
  reconciliationItemsDetailed,
  nextPendingItem,
  type ReconcileTurnResult,
} from "@/lib/v2/reconcile-mak-helpers";

export async function processReconcileTurn(
  user: AppUser,
  userId: string,
  demo: boolean,
  email: string,
  message: string,
): Promise<ReconcileTurnResult> {
  const meta = getOnboardingMetadata(user);
  const preview = previewReconcileTurn(meta, message);
  if (!preview.captured) return preview;

  const next = nextPendingItem(meta);
  if (!next) return { captured: false, complete: reconcileComplete(meta), pendingCount: 0 };

  const intentStatus = /^(no|n|not mine|reject|skip|dismiss|incorrect|not me)/i.test(message.trim())
    ? ("rejected" as const)
    : ("confirmed" as const);

  const reconciliation = (meta.reconciliation ?? []).map((r) =>
    r.id === next.id ? { ...r, status: intentStatus } : r,
  );
  const updatedReconciliation = reconciliation.some((r) => r.id === next.id)
    ? reconciliation
    : [...reconciliation, { id: next.id, status: intentStatus }];

  const updatedMeta = { ...meta, reconciliation: updatedReconciliation };
  const complete = reconcileComplete(updatedMeta);

  await upsertAppUser(
    userId,
    email,
    {
      tier2_complete: complete,
      onboarding_metadata: updatedMeta as Record<string, unknown>,
    },
    demo,
  );

  if (!demo) {
    await persistReconciliationStatuses(userId, [{ externalId: next.id, status: intentStatus }]);
  }

  const upcoming = nextPendingItem(updatedMeta);
  return {
    captured: true,
    complete,
    pendingCount: (updatedMeta.reconciliation ?? []).filter((r) => r.status === "pending").length,
    resolvedLabel: next.label,
    nextPrompt: complete
      ? "All set — your Career Data is reconciled. Let's move to your self-assessment next."
      : upcoming
        ? `Got it. Next — ${upcoming.label} (${upcoming.source}): ${upcoming.detail}\n\nIs this yours?`
        : undefined,
  };
}
