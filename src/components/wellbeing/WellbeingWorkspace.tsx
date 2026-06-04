"use client";

import { useCallback, useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { CardSection } from "@/components/ui/CardSection";
import { FcwiForm } from "@/components/wellbeing/FcwiForm";
import { WeeklyPulseForm } from "@/components/wellbeing/WeeklyPulseForm";
import { QuarterlySnapshotForm } from "@/components/wellbeing/QuarterlySnapshotForm";
import { WellbeingOrigamiPlot } from "@/components/wellbeing/WellbeingOrigamiPlot";

type CheckInStatus = { latest: { recorded_at: string } | null; due: boolean };
type SnapshotStatus = { due: boolean; last_completed: string | null };

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
  const [snapshotStatus, setSnapshotStatus] = useState<SnapshotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    const [fcwiRes, pulseRes, snapshotRes] = await Promise.allSettled([
      fetch("/api/v1/wellbeing/fcwi").then((r) => r.json() as Promise<CheckInStatus>),
      fetch("/api/v1/wellbeing/pulse").then((r) => r.json() as Promise<CheckInStatus>),
      fetch("/api/v1/wellbeing/quarterly-snapshot").then((r) => r.json() as Promise<SnapshotStatus>),
    ]);
    setFcwiStatus(fcwiRes.status === "fulfilled" ? fcwiRes.value : { latest: null, due: true });
    setPulseStatus(pulseRes.status === "fulfilled" ? pulseRes.value : { latest: null, due: true });
    setSnapshotStatus(snapshotRes.status === "fulfilled" ? snapshotRes.value : { due: true, last_completed: null });
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // "What's due now" subtitle — most urgent items first
  const dueItems = [
    snapshotStatus?.due && "quarterly snapshot",
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

      {/* Quarterly snapshot (most infrequent — show at top when due) */}
      {(snapshotStatus?.due || snapshotStatus?.last_completed) && (
        <CardSection
          className="mb-6"
          title="Quarterly snapshot"
          description={
            loading
              ? undefined
              : snapshotStatus?.due
                ? "A 5-minute recalibration: energy, role, goals, and setting."
                : snapshotStatus?.last_completed
                  ? `Completed ${formatDate(snapshotStatus.last_completed)}.`
                  : undefined
          }
        >
          {loading ? (
            <p className="text-sm text-cx-text/50">Loading…</p>
          ) : snapshotStatus?.due ? (
            <QuarterlySnapshotForm onSaved={() => void loadStatus()} />
          ) : (
            <p className="text-sm text-cx-text/60">
              Completed {snapshotStatus?.last_completed ? formatDate(snapshotStatus.last_completed) : ""}. Next snapshot due in about 3 months.
            </p>
          )}
        </CardSection>
      )}

      {/* Weekly pulse */}
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
          <p className="text-sm text-cx-text/50">Loading…</p>
        ) : pulseStatus?.due ? (
          <WeeklyPulseForm onSaved={() => void loadStatus()} />
        ) : (
          <p className="text-sm text-cx-text/60">
            {pulseStatus?.latest
              ? `Completed ${formatDate(pulseStatus.latest.recorded_at)}. Your next pulse will be ready in about a week.`
              : "No pulse check-ins yet."}
          </p>
        )}
      </CardSection>

      {/* Monthly check-in */}
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
          <p className="text-sm text-cx-text/50">Loading…</p>
        ) : fcwiStatus?.due ? (
          <FcwiForm onSaved={() => void loadStatus()} frequencyTier="monthly" />
        ) : (
          <p className="text-sm text-cx-text/60">
            {fcwiStatus?.latest
              ? `Completed ${formatDate(fcwiStatus.latest.recorded_at)}. Your next check-in will be ready in about a month.`
              : "No monthly check-ins yet."}
          </p>
        )}
      </CardSection>

      {/* B2 — Well-being origami plot + longitudinal trends (Phase 5.6) */}
      <CardSection
        title="Your well-being picture"
        description="Seven independent dimensions across your recent check-ins. Each bar shows where you are; the marker shows the meaningful boundary."
      >
        <WellbeingOrigamiPlot />
      </CardSection>

    </PageShell>
  );
}
