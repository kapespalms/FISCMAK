"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { fetchActivities } from "@/lib/activities-storage";
import { getDashboardStats } from "@/lib/lattice";

export function AssessmentWorkspace() {
  const [stats, setStats] = useState({
    total: 0,
    domainsActive: 0,
    tracksActive: 0,
    energizing: 0,
    draining: 0,
    recognitionGap: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const activities = await fetchActivities();
    if (activities.length > 0) {
      setStats(getDashboardStats(activities));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const coherenceScore =
    stats.total > 0
      ? Math.min(
          100,
          Math.round(
            (stats.energizing / Math.max(stats.total, 1)) * 60 +
              stats.domainsActive * 4 +
              stats.tracksActive * 3,
          ),
        )
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assessment: Patterns & signals</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Career pattern, recognition gaps, and coherence — explore with Mak
        </p>
      </div>

      {loading && <p className="text-sm text-fiscmak-muted">Loading…</p>}

      <Card accent="green">
        <h2 className="text-lg font-semibold">Career pattern</h2>
        <p className="mt-2 text-sm">
          <strong>Clinician-Educator with Emerging Systems Leadership</strong>
        </p>
        <p className="mt-2 text-sm text-fiscmak-muted">
          Based on {stats.total} logged activities across {stats.domainsActive}{" "}
          domains and {stats.tracksActive} tracks.
        </p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Strengths</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Badge energy="energizing">{stats.energizing}</Badge>
              <span>Energizing activities logged</span>
            </li>
            <li>Teaching and patient care evidence</li>
            <li>Cross-domain collaboration signals</li>
          </ul>
        </Card>

        <Card>
          <h2 className="font-semibold">Opportunities</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Badge energy="draining">{stats.draining}</Badge>
              <span>Draining activities to rebalance</span>
            </li>
            <li>Recognition gap: {stats.recognitionGap}%</li>
            <li>Leadership evidence under-documented</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Career coherence</h2>
        <p className="mt-2 text-sm text-fiscmak-muted">
          How well your logged work aligns with energizing, visible career signals
        </p>
        <div className="mt-4">
          {coherenceScore !== null ? (
            <>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-fiscmak-green">
                  {coherenceScore}
                </span>
                <span className="pb-1 text-fiscmak-muted">/ 100</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-fiscmak-subtle">
                <div
                  className="h-full rounded-full bg-fiscmak-green"
                  style={{ width: `${coherenceScore}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-fiscmak-muted">
              Log activities in Objective to calculate coherence.
            </p>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/app/objective?tab=lattice">
          <Button variant="secondary">View lattice</Button>
        </Link>
        <Link href="/app/plan">
          <Button>Plan next move</Button>
        </Link>
      </div>
    </div>
  );
}
