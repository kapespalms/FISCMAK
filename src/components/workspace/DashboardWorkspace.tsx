"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchActivities } from "@/lib/activities-storage";
import { getDashboardStats } from "@/lib/lattice";
import { loadEnergyHistory, loadSubjectiveCheckIn } from "@/lib/subjective-storage";
import { FIVE_OPTIONS } from "@/lib/mak-sections";
import { formatDisplayName } from "@/lib/mak-greeting";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAppShell } from "@/components/layout/AppShell";
import Link from "next/link";

export function DashboardWorkspace() {
  const { startMakFlow, setDisplayName } = useAppShell();
  const [stats, setStats] = useState({
    total: 0,
    weekCount: 0,
    energizing: 0,
    recognitionGap: 0,
    invisible: 0,
    energyLevel: 6,
    energyTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const load = useCallback(async () => {
    const activities = await fetchActivities();
    const base = getDashboardStats(activities);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = activities.filter(
      (a) => a.activity_date && new Date(a.activity_date) >= weekAgo,
    ).length;
    const documented = activities.filter(
      (a) => a.evidence_strength === "documented",
    ).length;
    const checkIn = loadSubjectiveCheckIn();
    const history = loadEnergyHistory();
    const trend =
      history.length >= 2
        ? history[history.length - 1].level - history[history.length - 2].level
        : 0;

    setStats({
      total: base.total,
      weekCount,
      energizing: base.energizing,
      recognitionGap: base.recognitionGap,
      invisible: base.total - documented,
      energyLevel: checkIn.energyLevel,
      energyTrend: trend,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    async function loadName() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(
          formatDisplayName(data.first_name, data.last_name),
        );
      }
    }
    void loadName();
  }, [setDisplayName]);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startMakFlow("upload", "/app/objective?tab=documents");
    setUploadOpen(false);
    e.target.value = "";
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Updated {new Date().toLocaleString()}
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-fiscmak-muted">Loading your summary…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/app/objective?tab=activities">
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">
                Activities logged
              </p>
              <p className="mt-2 text-3xl font-bold">{stats.total}</p>
              <p className="mt-1 text-sm text-fiscmak-muted">
                This week: {stats.weekCount}
              </p>
            </Card>
          </Link>

          <Link href="/app/subjective">
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">
                This week energy
              </p>
              <p className="mt-2 text-3xl font-bold text-fiscmak-green">
                {stats.energyLevel}/10
              </p>
              <p className="mt-1 text-sm text-fiscmak-muted">
                {stats.energyTrend >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(stats.energyTrend).toFixed(1)} trend
              </p>
            </Card>
          </Link>

          <Link href="/app/objective?tab=activities">
            <Card
              accent={stats.recognitionGap > 50 ? "red" : undefined}
              className="transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">
                Recognition gap
              </p>
              <p className="mt-2 text-3xl font-bold">{stats.invisible}</p>
              <p className="mt-1 text-sm text-fiscmak-muted">
                invisible of {stats.total} total
                {stats.recognitionGap > 30 && " · gap alert"}
              </p>
            </Card>
          </Link>

          <Link href="/app/subjective">
            <Card className="transition-shadow hover:shadow-md">
              <p className="text-xs font-semibold uppercase text-fiscmak-muted">
                Energy trend
              </p>
              <p className="mt-2 text-3xl font-bold">
                {stats.energizing}
                <span className="text-base font-normal text-fiscmak-muted">
                  {" "}
                  energizing
                </span>
              </p>
              <p className="mt-1 text-sm text-fiscmak-muted">Last 7 days</p>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => startMakFlow("capture")}
          className="flex min-h-12 items-center gap-3 rounded-lg bg-fiscmak-green px-4 py-3 text-left text-white transition-colors hover:bg-fiscmak-green-dark"
        >
          <Zap size={22} />
          <div>
            <p className="font-semibold">Capture Invisible Work</p>
            <p className="text-xs opacity-90">Log an activity in 30 seconds</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="flex min-h-12 items-center gap-3 rounded-lg border border-fiscmak-border bg-white px-4 py-3 text-left transition-colors hover:bg-fiscmak-subtle"
        >
          <Upload size={22} className="text-fiscmak-muted" />
          <div>
            <p className="font-semibold">Upload Document</p>
            <p className="text-xs text-fiscmak-muted">
              CV, dossier, template, or PDF text
            </p>
          </div>
        </button>
      </div>

      {uploadOpen && (
        <Card>
          <h2 className="font-semibold">Upload document</h2>
          <p className="mt-1 text-sm text-fiscmak-muted">
            Select a file — Mak will help you review extracted activities.
          </p>
          <input
            type="file"
            accept=".txt,.md,text/plain"
            className="mt-4 block w-full text-sm"
            onChange={handleUploadFile}
          />
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => setUploadOpen(false)}
          >
            Cancel
          </Button>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase text-fiscmak-muted">
          Mak suggestions
        </h2>
        <div className="grid gap-3">
          {FIVE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                startMakFlow(option.id, option.href)
              }
              className={`flex min-h-12 w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors ${option.bg}`}
            >
              <span className="text-2xl leading-none">{option.icon}</span>
              <div>
                <p className="font-semibold">{option.title}</p>
                <p className="text-sm text-fiscmak-muted">{option.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
