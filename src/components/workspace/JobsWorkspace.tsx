"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/layout/PageShell";
import { JOBS_MAK } from "@/lib/card-mak-prompts";
import type { Job } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

type Tab = "matches" | "saved";

type JobsWorkspaceProps = {
  embedded?: boolean;
};

export function JobsWorkspace({ embedded = false }: JobsWorkspaceProps) {
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
      <CardSection
        key={job.job_id}
        eyebrow={`${job.match_score}% match`}
        title={job.title}
        description={`${job.institution} · ${job.location}${job.salary ? ` · $${job.salary.toLocaleString()}` : ""}`}
        icon={Briefcase}
        mak={JOBS_MAK.role(job.title, job.institution ?? "Unknown institution", job.match_score ?? 0)}
        footer={
          <>
            <Button variant="secondary" onClick={() => void logView(job.job_id)}>
              View
            </Button>
            <Button
              variant={savedIds.has(job.job_id) ? "primary" : "secondary"}
              onClick={() => void saveJob(job.job_id)}
            >
              {savedIds.has(job.job_id) ? "Saved" : "Save"}
            </Button>
          </>
        }
      />
    );
  }

  const list = tab === "matches" ? jobs : savedJobs;

  const body = (
    <>
      {!embedded && (
        <Link href="/app/plan" className="mb-6 inline-block text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark">
          Back to strategy
        </Link>
      )}

      <div className="mb-6 flex gap-2">
        {(["matches", "saved"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "cx-nav-pill capitalize",
              tab === t ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-cx-forest-dark/70">Loading matches…</p>
      ) : list.length === 0 ? (
        <CardSection
          eyebrow="Job search"
          title={tab === "saved" ? "No saved positions" : "No matches yet"}
          description={
            tab === "saved"
              ? "Save positions from your match feed to compare them with Mak."
              : "Matches appear as your Career Profile and goals are populated."
          }
          icon={Briefcase}
          mak={JOBS_MAK.overview}
        />
      ) : (
        <div className="space-y-4">
          {list.length > 1 && (
            <CardSection
              compact
              eyebrow="Match feed"
              title={`${list.length} position${list.length > 1 ? "s" : ""}`}
              mak={JOBS_MAK.overview}
            />
          )}
          {list.map(renderJob)}
        </div>
      )}
    </>
  );

  if (embedded) return body;

  return (
    <PageShell
      eyebrow="Position search"
      title="Job matches"
      subtitle={commentary || undefined}
      maxWidth="lg"
    >
      {body}
    </PageShell>
  );
}
