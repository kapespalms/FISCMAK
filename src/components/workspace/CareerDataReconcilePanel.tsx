"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    return <p className="text-sm text-cx-text-secondary">Loading items pending review…</p>;
  }

  if (!items.length) {
    return (
      <Card>
        <p className="text-cx-body">
          No enrichment items pending review. Upload an updated CV to trigger API reconciliation.
        </p>
      </Card>
    );
  }

  return (
    <Card accent={pending.length ? "amber" : "green"}>
      <p className="text-cx-label uppercase">Reconciliation queue</p>
      <h2 className="mt-1 text-cx-h3">
        {pending.length
          ? `${pending.length} item${pending.length > 1 ? "s" : ""} pending review`
          : "All items reviewed"}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-cx-border bg-cx-cream/40 p-4 text-sm"
          >
            <p className="font-semibold text-cx-text">{item.label}</p>
            <p className="mt-1 text-cx-body">{item.detail}</p>
            <p className="mt-1 text-cx-label">Source: {item.source}</p>
            {item.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <Button onClick={() => setStatus(item.id, "confirmed")}>
                  Confirm
                </Button>
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
        <p className="mt-3 rounded-xl border border-cx-attention bg-amber-50 px-4 py-3 text-sm text-cx-text">
          {error}
        </p>
      )}
      {pending.length > 0 && (
        <Button className="mt-4" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save reconciliation"}
        </Button>
      )}
    </Card>
  );
}
