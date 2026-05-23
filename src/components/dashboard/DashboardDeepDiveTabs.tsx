"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SoapBandSnapshot } from "@/lib/v2/dashboard-snapshot";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "objective", label: "Career Data", href: "/app/objective" },
  { id: "plan", label: "Career Strategy", href: "/app/plan" },
  { id: "jobs", label: "Job Matches", href: "/app/jobs" },
  { id: "output", label: "Documents", href: "/app/output" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type DashboardDeepDiveTabsProps = {
  bands: SoapBandSnapshot[];
  jobEngagement?: { jobs_viewed: number; jobs_saved: number; average_match_score: number | null };
  onDiscuss: (href: string) => void;
};

function bandForTab(bands: SoapBandSnapshot[], tab: TabId): SoapBandSnapshot | undefined {
  const map: Record<TabId, SoapBandSnapshot["id"]> = {
    objective: "objective",
    plan: "plan",
    jobs: "assessment",
    output: "output",
  };
  return bands.find((b) => b.id === map[tab]);
}

function tabPreview(
  band: SoapBandSnapshot | undefined,
  tab: TabId,
  jobEngagement?: DashboardDeepDiveTabsProps["jobEngagement"],
): string {
  if (tab === "jobs" && jobEngagement) {
    const parts = [
      `${jobEngagement.jobs_viewed} viewed`,
      `${jobEngagement.jobs_saved} saved`,
    ];
    if (jobEngagement.average_match_score != null) {
      parts.push(`avg match ${Math.round(jobEngagement.average_match_score)}%`);
    }
    return parts.join(" · ");
  }
  if (!band) return "Open this section to explore.";
  if (band.vaultSummary) return band.vaultSummary;
  if (band.lines[0]) return band.lines[0];
  if (band.strengths?.length) return `Strengths: ${band.strengths.slice(0, 2).join(", ")}`;
  return band.subtitle;
}

export function DashboardDeepDiveTabs({ bands, jobEngagement, onDiscuss }: DashboardDeepDiveTabsProps) {
  const [active, setActive] = useState<TabId>("objective");
  const router = useRouter();
  const band = bandForTab(bands, active);
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section aria-labelledby="deep-dive-heading">
      <h2 id="deep-dive-heading" className="text-cx-h2">
        Deep Dive
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active === t.id
                ? "bg-cx-primary text-white"
                : "bg-cx-white text-cx-text-secondary hover:bg-white/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="cx-card mt-6">
        <p className="text-cx-body">{tabPreview(band, active, jobEngagement)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={tab.href}
            className="inline-flex rounded-lg bg-cx-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Open {tab.label}
          </Link>
          <button
            type="button"
            onClick={() => {
              onDiscuss(tab.href);
              router.push(tab.href);
            }}
            className="rounded-lg border border-cx-border px-4 py-2 text-sm font-medium text-cx-text hover:bg-cx-cream"
          >
            Discuss with Mak
          </button>
        </div>
      </div>
    </section>
  );
}
