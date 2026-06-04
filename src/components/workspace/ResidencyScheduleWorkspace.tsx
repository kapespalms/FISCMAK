"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { CallScheduleView } from "@/components/uh-psych/CallScheduleView";
import { ScheduleCalendarWorkspace } from "@/components/workspace/ScheduleCalendarWorkspace";
import { scheduleExternalLinks, uhPsychProgram } from "@/lib/v2/programs/uh-residency-content";

const TABS = [
  { id: "blocks", label: "Block calendar" },
  { id: "call", label: "Call coverage" },
  { id: "links", label: "MedHub/QGenda links" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function isTabId(value: string | null): value is TabId {
  return value === "blocks" || value === "call" || value === "links";
}

export function ResidencyScheduleWorkspace() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId = isTabId(tabParam) ? tabParam : "blocks";
  const [mounted, setMounted] = useState(false);
  const program = uhPsychProgram();
  const externalLinks = scheduleExternalLinks();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-cx-text/70">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
            {program?.institution_name ?? "University Hospitals"}
          </p>
          <h1 className="text-page-title">Schedule</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-text/75">
            Block rotations, call coverage, and external calendar links — one place.
          </p>
        </div>
        <Link
          href="/app/uh-psych"
          className="text-sm font-medium text-cx-text underline-offset-2 hover:underline"
        >
          ← Rotations
        </Link>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Schedule views">
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app/schedule?tab=${id}`}
            role="tab"
            aria-selected={tab === id}
            className={cn(
              "cx-nav-pill",
              tab === id ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      {tab === "blocks" && <ScheduleCalendarWorkspace embedded />}
      {tab === "call" && <CallScheduleView embedded />}
      {tab === "links" && (
        <section className="space-y-3">
          <ul className="divide-y divide-cx-forest-dark/10 rounded-2xl border border-cx-forest-dark/15 bg-white/80">
            {externalLinks.map((link) => (
              <li key={link.id}>
                {link.href ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-4 py-4 transition hover:bg-cx-forest-dark/[0.03]"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-cx-text/50" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-cx-text">{link.label}</p>
                      <p className="mt-0.5 text-sm text-cx-text/70">{link.description}</p>
                      {link.note && (
                        <p className="mt-1 text-xs text-cx-text/55">{link.note}</p>
                      )}
                    </div>
                  </a>
                ) : (
                  <div className="px-4 py-4">
                    <p className="text-sm font-semibold text-cx-text">{link.label}</p>
                    <p className="mt-0.5 text-sm text-cx-text/70">{link.description}</p>
                    {link.note && (
                      <p className="mt-1 text-xs text-cx-text/55">{link.note}</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
