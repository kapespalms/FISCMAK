"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";
import type { ReconciliationItem } from "@/lib/v2/onboarding-touchpoint1";

function isAutoConfirmed(item: ReconciliationItem): boolean {
  return (
    item.status === "confirmed" &&
    (item.confidence === "exact_match" || item.confidence === "verified_registry")
  );
}

function confidencePill(item: ReconciliationItem): { label: string; className: string } | null {
  if (item.confidence === "exact_match" && item.status === "confirmed") {
    return {
      label: "CV exact match",
      className: "bg-emerald-100 text-emerald-900",
    };
  }
  if (item.confidence === "verified_registry" && item.status === "confirmed") {
    return {
      label: "Registry verified",
      className: "bg-emerald-100 text-emerald-900",
    };
  }
  if (item.confidence === "manual_review" && item.status === "pending") {
    return {
      label: "Manual review needed",
      className: "bg-[#E7DEC9]/60 text-[#20201D]",
    };
  }
  return null;
}

export function CareerDataReconcilePanel() {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/onboarding/reconciliation");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setError("Could not load reconciliation items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(
    () => items.filter((i) => i.status === "pending"),
    [items],
  );
  const autoConfirmed = useMemo(
    () => items.filter((i) => isAutoConfirmed(i)),
    [items],
  );
  const manuallyReviewed = useMemo(
    () =>
      items.filter(
        (i) => i.status !== "pending" && !isAutoConfirmed(i),
      ),
    [items],
  );

  function setStatus(id: string, status: "confirmed" | "rejected") {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status, confidence: i.confidence ?? "manual_review" } : i,
      ),
    );
  }

  function confirmAllPending() {
    setItems((prev) =>
      prev.map((i) =>
        i.status === "pending"
          ? { ...i, status: "confirmed" as const, confidence: "manual_review" as const }
          : i,
      ),
    );
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, status: i.status })),
      }),
    });
    if (!res.ok) {
      setError("Could not save reconciliation.");
      setSaving(false);
      return;
    }
    setSaving(false);
    void load();
  }

  if (loading) {
    return <p className="text-sm text-cx-text/70">Loading items pending review…</p>;
  }

  if (!items.length) {
    return (
      <CardSection
        eyebrow="Reconciliation"
        title="Nothing to review"
        description="No enrichment items pending review. Upload an updated CV to trigger API reconciliation."
        icon={GitCompare}
        mak={OBJECTIVE_MAK.reconcile}
      />
    );
  }

  return (
    <CardSection
      accent={pending.length ? "amber" : "green"}
      eyebrow="Reconciliation queue"
      title={
        pending.length
          ? `${pending.length} item${pending.length > 1 ? "s" : ""} pending review`
          : autoConfirmed.length
            ? `${autoConfirmed.length} auto-confirmed · all clear`
            : "All items reviewed"
      }
      icon={GitCompare}
      mak={OBJECTIVE_MAK.reconcile}
      footer={
        pending.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={confirmAllPending} disabled={saving}>
              Confirm all pending
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save reconciliation"}
            </Button>
          </div>
        ) : undefined
      }
    >
      {autoConfirmed.length > 0 && (
        <ul className="mb-4 space-y-2">
          {autoConfirmed.map((item) => {
            const pill = confidencePill(item);
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm"
              >
                <span className="font-semibold text-emerald-950">{item.label}</span>
                {pill && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${pill.className}`}
                  >
                    {pill.label}
                  </span>
                )}
                <span className="text-xs text-emerald-900/70">No action needed</span>
              </li>
            );
          })}
        </ul>
      )}

      {pending.length > 0 && (
        <ul className="space-y-3">
          {pending.map((item) => {
            const pill = confidencePill(item);
            return (
              <li
                key={item.id}
                className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-cx-text">{item.label}</p>
                  {pill && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${pill.className}`}
                    >
                      {pill.label}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-cx-text/80">{item.detail}</p>
                <p className="mt-1 text-cx-label">Source: {item.source}</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => setStatus(item.id, "confirmed")}>Confirm</Button>
                  <Button variant="secondary" onClick={() => setStatus(item.id, "rejected")}>
                    Reject
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {manuallyReviewed.length > 0 && (
        <div className={pending.length > 0 || autoConfirmed.length > 0 ? "mt-6 border-t border-cx-forest-dark/10 pt-4" : ""}>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/50">
            Manually reviewed
          </p>
          <ul className="mt-3 space-y-2">
            {manuallyReviewed.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-cx-forest-dark/10 px-3 py-2 text-sm text-cx-text/80"
              >
                <span className="font-medium text-cx-text">{item.label}</span>
                <span className="ml-2 text-xs capitalize text-cx-text/55">{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
          {error}
        </p>
      )}
    </CardSection>
  );
}
