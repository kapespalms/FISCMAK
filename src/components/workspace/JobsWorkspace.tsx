"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/lib/v2/types";

export function JobsWorkspace() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/jobs/matches")
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs ?? []);
        setCommentary(d.mak_commentary ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function saveJob(id: string) {
    await fetch(`/api/v1/jobs/${id}/save`, { method: "POST" });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job matches</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">{commentary}</p>
      </div>
      {loading ? (
        <p className="text-sm text-fiscmak-muted">Loading matches…</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.job_id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{job.title}</h2>
                  <p className="text-sm text-fiscmak-muted">
                    {job.institution} · {job.location}
                  </p>
                  {job.salary && (
                    <p className="mt-1 text-sm">${job.salary.toLocaleString()}</p>
                  )}
                  <p className="mt-2 text-xs text-fiscmak-green font-semibold">
                    Match {job.match_score}%
                  </p>
                </div>
                <Button variant="secondary" onClick={() => saveJob(job.job_id)}>
                  Save
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
