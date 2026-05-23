"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

type Tab = "matches" | "saved";

export function JobsWorkspace() {
  const [tab, setTab] = useState<Tab>("matches");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const loadMatches = useCallback(() => {
    return fetch("/api/v1/jobs/matches")
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs ?? []);
        setCommentary(d.mak_commentary ?? "");
      });
  }, []);

  const loadSaved = useCallback(() => {
    return fetch("/api/v1/jobs/saved")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.jobs ?? []) as Job[];
        setSavedJobs(list);
        setSavedIds(new Set(list.map((j) => j.job_id)));
      });
  }, []);

  useEffect(() => {
    Promise.all([loadMatches(), loadSaved()])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [loadMatches, loadSaved]);

  async function logView(id: string) {
    await fetch(`/api/v1/jobs/${id}/view`, { method: "POST" });
  }

  async function saveJob(id: string) {
    await fetch(`/api/v1/jobs/${id}/save`, { method: "POST" });
    setSavedIds((prev) => new Set(prev).add(id));
    await loadSaved();
  }

  function renderJob(job: Job) {
    return (
      <Card key={job.job_id}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-cx-text">{job.title}</h2>
            <p className="text-sm text-cx-text-secondary">
              {job.institution} · {job.location}
            </p>
            {job.salary && (
              <p className="mt-1 text-sm text-cx-text">${job.salary.toLocaleString()}</p>
            )}
            <p className="mt-2 text-xs font-semibold text-cx-primary">
              Match {job.match_score}%
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                void logView(job.job_id);
              }}
            >
              View
            </Button>
            <Button
              variant={savedIds.has(job.job_id) ? "primary" : "secondary"}
              onClick={() => void saveJob(job.job_id)}
            >
              {savedIds.has(job.job_id) ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const list = tab === "matches" ? jobs : savedJobs;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-cx-label text-cx-primary">P-3 · Position search</p>
        <h1 className="text-cx-h1">Job matches</h1>
        <p className="mt-1 text-cx-body">{commentary}</p>
        <Link href="/app/plan" className="mt-2 inline-block text-sm font-medium text-cx-primary hover:underline">
          ← Back to strategy
        </Link>
      </div>

      <div className="flex gap-2">
        {(["matches", "saved"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium capitalize",
              tab === t ? "bg-cx-primary text-white" : "bg-cx-cream text-cx-text-secondary",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-cx-text-secondary">Loading matches…</p>
      ) : list.length === 0 ? (
        <div className="cx-card">
          <p className="text-cx-body">
            {tab === "saved" ? "No saved positions yet." : "No matches in feed yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">{list.map(renderJob)}</div>
      )}
    </div>
  );
}
