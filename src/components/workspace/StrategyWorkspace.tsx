"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { GoalsWorkspace } from "@/components/workspace/GoalsWorkspace";
import { JobsWorkspace } from "@/components/workspace/JobsWorkspace";
import { PathwaysExplorer } from "@/components/workspace/PathwaysExplorer";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";

const TABS = [
  { id: "goals", label: "Goals" },
  { id: "pathways", label: "Pathways" },
  { id: "jobs", label: "Jobs" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabFromParam(tabParam: string | null): TabId {
  if (tabParam === "jobs" || tabParam === "pathways") return tabParam;
  return "goals";
}

function StrategyWorkspaceInner() {
  const searchParams = useSearchParams();
  const tab = tabFromParam(searchParams.get("tab"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-cx-text/70">Loading…</p>;
  }

  const title =
    tab === "jobs"
      ? "Position search"
      : tab === "pathways"
        ? "Career pathways"
        : SOAP_TAB.plan.title;

  const subtitle =
    tab === "jobs"
      ? "Explore matched roles and saved positions alongside your career strategy."
      : tab === "pathways"
        ? "Compare specialty tracks, market demand, and salary ranges — then jump to matched roles."
        : SOAP_TAB.plan.description;

  return (
    <PageShell
      eyebrow={SOAP_TAB.plan.nav}
      title={title}
      subtitle={subtitle}
      maxWidth={tab === "goals" ? "md" : "lg"}
    >
      <AcademicSoapSectionGate intent="plan" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app/plan?tab=${id}`}
            className={cn(
              "cx-nav-pill",
              tab === id ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      {tab === "goals" && <GoalsWorkspace embedded />}
      {tab === "pathways" && <PathwaysExplorer embedded />}
      {tab === "jobs" && <JobsWorkspace embedded />}
    </PageShell>
  );
}

export function StrategyWorkspace() {
  return (
    <Suspense fallback={<p className="text-sm text-cx-text/70">Loading…</p>}>
      <StrategyWorkspaceInner />
    </Suspense>
  );
}
