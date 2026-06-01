"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CardSection } from "@/components/ui/CardSection";
import { FcwiForm } from "@/components/wellbeing/FcwiForm";

type FcwiStatus = { latest: { recorded_at: string; frequency_tier: string } | null; due: boolean };

export function WellbeingWorkspace() {
  const [fcwiStatus, setFcwiStatus] = useState<FcwiStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/wellbeing/fcwi");
      const data = (await res.json()) as FcwiStatus;
      setFcwiStatus(data);
    } catch {
      setFcwiStatus({ latest: null, due: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  function handleFcwiSaved() {
    void loadStatus();
  }

  const lastFcwiDate = fcwiStatus?.latest?.recorded_at
    ? new Date(fcwiStatus.latest.recorded_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // "What's due now" summary — expands in 3.2 with weekly pulse logic
  const dueNow = fcwiStatus?.due;
  const subtitle = loading
    ? undefined
    : dueNow
      ? "Your monthly check-in is ready."
      : lastFcwiDate
        ? `Last check-in: ${lastFcwiDate}`
        : undefined;

  return (
    <PageShell eyebrow="Well-Being" title="Your Well-Being" subtitle={subtitle} maxWidth="lg">

      {/* B1 — Monthly check-in (FCWI, 3.1) */}
      <CardSection
        className="mb-6"
        title="Monthly check-in"
        description={
          loading
            ? undefined
            : fcwiStatus?.due
              ? "Nine questions, about 2 minutes."
              : "You're up to date. Check back next month."
        }
      >
        {loading ? (
          <p className="text-sm text-cx-forest-dark/50">Loading…</p>
        ) : fcwiStatus?.due ? (
          <FcwiForm onSaved={handleFcwiSaved} frequencyTier="monthly" />
        ) : (
          <p className="text-sm text-cx-forest-dark/60">
            Completed {lastFcwiDate}. Your next check-in will be available in about a month.
          </p>
        )}
      </CardSection>

      {/* B1 — Weekly pulse (placeholder, 3.2) */}
      <CardSection
        className="mb-6"
        title="Weekly pulse"
        description="A one-minute check on how this week felt."
      >
        <p className="text-sm text-cx-forest-dark/50">
          Weekly pulse check-in coming soon.
        </p>
      </CardSection>

      {/* B2 — Well-being picture (placeholder, Phase 5) */}
      <CardSection
        title="Your well-being picture"
        description="Patterns across your check-ins — available once you have a few months of data."
      >
        <p className="text-sm text-cx-forest-dark/50">
          Trends and patterns will appear here as you complete regular check-ins.
        </p>
      </CardSection>

    </PageShell>
  );
}
