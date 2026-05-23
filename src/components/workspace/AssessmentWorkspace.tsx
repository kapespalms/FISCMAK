"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/layout/PageShell";
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
    <PageShell
      eyebrow="Assessment"
      title="Patterns and signals"
      subtitle="Career pattern, recognition gaps, and coherence — explore with Mak"
      maxWidth="lg"
    >
      {loading && <p className="text-sm text-cx-text-secondary">Loading…</p>}

      <Card accent="green" className="mb-6">
        <p className="text-cx-label uppercase">Career pattern</p>
        <p className="mt-2 text-cx-h3">Clinician-Educator with Emerging Systems Leadership</p>
        <p className="mt-2 text-cx-body">
          Based on {stats.total} logged activities across {stats.domainsActive}{" "}
          domains and {stats.tracksActive} tracks.
        </p>
      </Card>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-cx-h3">Strengths</h2>
          <ul className="mt-3 space-y-2 text-sm text-cx-text">
            <li className="flex items-start gap-2">
              <Badge energy="energizing">{stats.energizing}</Badge>
              <span>Energizing activities logged</span>
            </li>
            <li>Teaching and patient care evidence</li>
            <li>Cross-domain collaboration signals</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-cx-h3">Recognition gaps</h2>
          <p className="mt-3 text-cx-body">
            {stats.recognitionGap > 0
              ? `${stats.recognitionGap} activities may be under-documented on your CV.`
              : "Log more activities to surface recognition gaps."}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <p className="text-cx-label uppercase">Coherence score</p>
        <p className="mt-2 text-score-hero">{coherenceScore ?? "—"}</p>
        <p className="mt-2 text-cx-body">
          How well your logged work aligns across domains and energy levels.
        </p>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/app/assessment">
          <Button variant="secondary">Full career profile</Button>
        </Link>
        <Link
          href="/app/objective"
          className="inline-flex items-center gap-1 text-sm font-medium text-cx-text hover:text-cx-primary"
        >
          Open career data
          <ChevronRight size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
