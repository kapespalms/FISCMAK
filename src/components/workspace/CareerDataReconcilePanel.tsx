"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";

type ReconciliationItem = {
  id: string;
  label: string;
  detail: string;
  source: string;
  status: "pending" | "confirmed" | "rejected";
};

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

  function setStatus(id: string, status: "confirmed" | "rejected") {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, status: i.status === "pending" ? "confirmed" : i.status })),
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

  const pending = items.filter((i) => i.status === "pending");

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading items pending review…</p>;
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
          : "All items reviewed"
      }
      icon={GitCompare}
      mak={OBJECTIVE_MAK.reconcile}
      footer={
        pending.length > 0 ? (
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save reconciliation"}
          </Button>
        ) : undefined
      }
    >
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4 text-sm"
          >
            <p className="font-semibold text-cx-forest-dark">{item.label}</p>
            <p className="mt-1 text-sm text-cx-forest-dark/80">{item.detail}</p>
            <p className="mt-1 text-cx-label">Source: {item.source}</p>
            {item.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <Button onClick={() => setStatus(item.id, "confirmed")}>Confirm</Button>
                <Button variant="secondary" onClick={() => setStatus(item.id, "rejected")}>
                  Reject
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-cx-label capitalize">{item.status}</p>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
          {error}
        </p>
      )}
    </CardSection>
  );
}
