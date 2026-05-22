"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getDashboardStats } from "@/lib/lattice";
import type { ActivityEntry } from "@/lib/types/database";

export default function DashboardPage() {
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
    if (!isSupabaseConfigured()) {
      setStats({
        total: 24,
        domainsActive: 6,
        tracksActive: 4,
        energizing: 14,
        draining: 6,
        recognitionGap: 34,
      });
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("activity_entries")
      .select("*")
      .eq("user_id", user.id);

    setStats(getDashboardStats((data as ActivityEntry[]) ?? []));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-fiscmak-muted">SOAP career intelligence</p>
      </div>

      {loading && <p className="text-sm text-fiscmak-muted">Loading…</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card accent="green">
          <h2 className="text-lg font-semibold">Subjective</h2>
          <p className="mt-2 text-sm text-fiscmak-muted">Energy signals</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge energy="energizing">{stats.energizing} energizing</Badge>
            <Badge energy="draining">{stats.draining} draining</Badge>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Objective</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <strong>{stats.total}</strong> activities logged
            </li>
            <li>
              <strong>{stats.domainsActive}</strong> domains active
            </li>
            <li>
              <strong>{stats.tracksActive}</strong> tracks active
            </li>
          </ul>
          <Link href="/app/lattice" className="mt-4 inline-block">
            <Button variant="link">View lattice →</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Assessment</h2>
          <p className="mt-2 text-sm">
            Pattern:{" "}
            <strong>Clinician-Educator with Emerging Systems Leadership</strong>
          </p>
          <ul className="mt-4 space-y-1 text-sm text-fiscmak-muted">
            <li>Recognition gap: {stats.recognitionGap}%</li>
            <li>Alignment signal: —</li>
            <li>Career coherence: —</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Plan</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
            <li>Log activities in under-documented domains</li>
            <li>Generate annual review draft</li>
            <li>Monthly reflection with Mak</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/app/goals">
              <Button variant="secondary">View goals</Button>
            </Link>
            <Link href="/app/studio">
              <Button>Generate output</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
