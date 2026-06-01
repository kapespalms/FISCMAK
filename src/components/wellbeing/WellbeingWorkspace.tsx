"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CardSection } from "@/components/ui/CardSection";
import { FcwiForm } from "@/components/wellbeing/FcwiForm";
import { WeeklyPulseForm } from "@/components/wellbeing/WeeklyPulseForm";

type CheckInStatus = {
  latest: { recorded_at: string } | null;
  due: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function WellbeingWorkspace() {
  const [fcwiStatus, setFcwiStatus] = useState<CheckInStatus | null>(null);
  const [pulseStatus, setPulseStatus] = useState<CheckInStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    const [fcwiRes, pulseRes] = await Promise.allSettled([
      fetch("/api/v1/wellbeing/fcwi").then((r) => r.json() as Promise<CheckInStatus>),
      fetch("/api/v1/wellbeing/pulse").then((r) => r.json() as Promise<CheckInStatus>),
    ]);
    setFcwiStatus(fcwiRes.status === "fulfilled" ? fcwiRes.value : { latest: null, due: true });
    setPulseStatus(pulseRes.status === "fulfilled" ? pulseRes.value : { latest: null, due: true });
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // "What's due now" subtitle
  const dueItems = [
    fcwiStatus?.due && "monthly check-in",
    pulseStatus?.due && "weekly pulse",
  ].filter(Boolean);

  const subtitle = loading
    ? undefined
    : dueItems.length > 0
      ? `Ready now: ${dueItems.join(" · ")}`
      : "You're up to date — check back soon.";

  return (
    <PageShell eyebrow="Well-Being" title="Your Well-Being" subtitle={subtitle} maxWidth="lg">

      {/* B1 — Weekly pulse (most frequent — shown first) */}
      <CardSection
        className="mb-6"
        title="Weekly pulse"
        description={
          loading
            ? undefined
            : pulseStatus?.due
              ? "Four questions, about 1 minute."
              : pulseStatus?.latest
                ? `Completed ${formatDate(pulseStatus.latest.recorded_at)}.`
                : undefined
        }
      >
        {loading ? (
          <p className="text-sm text-cx-forest-dark/50">Loading…</p>
        ) : pulseStatus?.due ? (
          <WeeklyPulseForm onSaved={() => void loadStatus()} />
        ) : (
          <p className="text-sm text-cx-forest-dark/60">
            {pulseStatus?.latest
              ? `Completed ${formatDate(pulseStatus.latest.recorded_at)}. Your next pulse will be ready in about a week.`
              : "No pulse check-ins yet."}
          </p>
        )}
      </CardSection>

      {/* B1 — Monthly check-in (FCWI) */}
      <CardSection
        className="mb-6"
        title="Monthly check-in"
        description={
          loading
            ? undefined
            : fcwiStatus?.due
              ? "Nine questions, about 2 minutes."
              : fcwiStatus?.latest
                ? `Completed ${formatDate(fcwiStatus.latest.recorded_at)}.`
                : undefined
        }
      >
        {loading ? (
          <p className="text-sm text-cx-forest-dark/50">Loading…</p>
        ) : fcwiStatus?.due ? (
          <FcwiForm onSaved={() => void loadStatus()} frequencyTier="monthly" />
        ) : (
          <p className="text-sm text-cx-forest-dark/60">
            {fcwiStatus?.latest
              ? `Completed ${formatDate(fcwiStatus.latest.recorded_at)}. Your next check-in will be ready in about a month.`
              : "No monthly check-ins yet."}
          </p>
        )}
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
