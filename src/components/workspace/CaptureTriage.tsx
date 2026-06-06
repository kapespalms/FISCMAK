"use client";

/**
 * C1: Confidence-triage confirmation UI.
 *
 * Auto-accepted (confidence ≥ 0.80): shown as a count, pre-approved.
 * Needs-review (confidence < 0.80): shown individually — "ring true?" / "not mine".
 * One bulk-confirm closes the loop → evidence_unit via confirm-batch.
 *
 * Spec rules:
 *   - Physician confirms the rolled-up picture, not a 30-row audit log.
 *   - Nothing enters the lattice unconfirmed.
 *   - Reward recognition, never volume. No streaks or counts that gamify logging.
 */

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { PendingItem, PendingResult } from "@/app/api/v1/activities/pending/route";

type ItemDecision = "accept" | "dismiss" | null;

function sourceLabel(source: string | null): string {
  if (!source) return "capture";
  if (source === "pulse") return "pulse";
  if (source.startsWith("mak_")) return "Mak";
  if (source === "chat") return "Mak";
  return source;
}

function energyLabel(valence: string | null): string | null {
  if (valence === "energizing") return "energizing";
  if (valence === "draining") return "draining";
  return null;
}

export function CaptureTriage({ onConfirmed }: { onConfirmed?: () => void }) {
  const [data, setData] = useState<PendingResult | null>(null);
  const [decisions, setDecisions] = useState<Record<string, ItemDecision>>({});
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/activities/pending");
      if (!res.ok) return;
      const json = (await res.json()) as PendingResult;
      setData(json);
      setDone(false);
      setDecisions({});
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    void load();
    const onLogged = () => void load();
    window.addEventListener("fiscmak:activity-logged", onLogged);
    return () => window.removeEventListener("fiscmak:activity-logged", onLogged);
  }, [load]);

  if (!data || (data.auto_accept.length === 0 && data.needs_review.length === 0)) {
    return null;
  }

  if (done) return null;

  function decide(id: string, choice: ItemDecision) {
    setDecisions((prev) => ({ ...prev, [id]: choice }));
  }

  async function confirmAll() {
    if (!data) return;
    setConfirming(true);
    setError(null);

    const items: Array<{ id: string; accept: boolean }> = [
      // Auto-accepted — all confirmed unless explicitly dismissed (shouldn't happen)
      ...data.auto_accept.map((a) => ({ id: a.id, accept: decisions[a.id] !== "dismiss" })),
      // Needs-review — accept unless dismissed; unset = accept (action-by-exception)
      ...data.needs_review.map((a) => ({ id: a.id, accept: decisions[a.id] !== "dismiss" })),
    ];

    try {
      const res = await fetch("/api/v1/activities/confirm-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { message?: string };
        throw new Error((json.message as string | undefined) ?? "Confirm failed");
      }
      setDone(true);
      window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
      onConfirmed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm captures");
    } finally {
      setConfirming(false);
    }
  }

  const autoCount = data.auto_accept.length;
  const reviewItems = data.needs_review;
  const dismissedCount = Object.values(decisions).filter((d) => d === "dismiss").length;

  return (
    <div className="cx-surface-elevated rounded-2xl border border-cx-forest-dark/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-cx-text/60">
            Capture review
          </p>
          <h3 className="mt-0.5 font-semibold text-cx-text">
            Does this picture ring true?
          </h3>
          <p className="mt-1 text-sm text-cx-text/70">
            {data.total} recent{" "}
            {data.total === 1 ? "capture" : "captures"} waiting to join your career map.
          </p>
        </div>
      </div>

      {/* Auto-accepted summary — collapsed, no individual items */}
      {autoCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#3C8A60]/8 px-4 py-3">
          <Check size={15} className="shrink-0 text-[#3C8A60]" aria-hidden />
          <p className="text-sm text-cx-text/80">
            <span className="font-medium">{autoCount}</span>{" "}
            {autoCount === 1 ? "item" : "items"} auto-accepted (high confidence)
          </p>
        </div>
      )}

      {/* Needs-review items */}
      {reviewItems.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-cx-text/60">
            {reviewItems.length === 1 ? "1 item needs" : `${reviewItems.length} items need`} a quick look
          </p>
          {reviewItems.map((item) => (
            <ReviewItem
              key={item.id}
              item={item}
              decision={decisions[item.id] ?? null}
              onDecide={(choice) => decide(item.id, choice)}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-[#C28D6C]">{error}</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={() => void confirmAll()} disabled={confirming}>
          {confirming
            ? "Saving…"
            : dismissedCount > 0
              ? `Confirm (${data.total - dismissedCount})`
              : "Confirm all"}
        </Button>
        <button
          type="button"
          onClick={() => setDone(true)}
          className="text-sm text-cx-text/60 hover:text-cx-text/80"
        >
          Later
        </button>
      </div>
    </div>
  );
}

function ReviewItem({
  item,
  decision,
  onDecide,
}: {
  item: PendingItem;
  decision: ItemDecision;
  onDecide: (d: ItemDecision) => void;
}) {
  const isDismissed = decision === "dismiss";
  const isAccepted = decision === "accept";
  const energy = energyLabel(item.energy_valence);

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition-colors",
        isDismissed
          ? "border-[#C28D6C]/20 bg-[#C28D6C]/5 opacity-60"
          : isAccepted
            ? "border-[#3C8A60]/20 bg-[#3C8A60]/5"
            : "border-cx-forest-dark/10 bg-white/50",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-cx-text">
            {item.raw_text ?? "—"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-cx-text/60">
            <span>{sourceLabel(item.input_source)}</span>
            {energy && <span>{energy}</span>}
            {item.activity_date && <span>{item.activity_date}</span>}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Ring true — accept this capture"
            aria-pressed={isAccepted}
            onClick={() => onDecide(isAccepted ? null : "accept")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors",
              isAccepted
                ? "border-[#3C8A60]/40 bg-[#3C8A60]/15 text-[#3C8A60]"
                : "border-cx-forest-dark/15 text-cx-text/50 hover:border-[#3C8A60]/30 hover:bg-[#3C8A60]/8",
            )}
            title="Ring true"
          >
            <Check size={14} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Not mine — dismiss this capture"
            aria-pressed={isDismissed}
            onClick={() => onDecide(isDismissed ? null : "dismiss")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors",
              isDismissed
                ? "border-[#C28D6C]/40 bg-[#C28D6C]/15 text-[#C28D6C]"
                : "border-cx-forest-dark/15 text-cx-text/50 hover:border-[#C28D6C]/30 hover:bg-[#C28D6C]/8",
            )}
            title="Not mine"
          >
            <X size={14} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
