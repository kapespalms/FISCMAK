"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { GoalsWorkspace } from "@/components/workspace/GoalsWorkspace";
import { JobsWorkspace } from "@/components/workspace/JobsWorkspace";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";

const TABS = [
  { id: "goals", label: "Goals" },
  { id: "jobs", label: "Jobs" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function StrategyWorkspaceInner() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId = tabParam === "jobs" ? "jobs" : "goals";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-cx-forest-dark/70">Loading…</p>;
  }

  return (
    <PageShell
      eyebrow={SOAP_TAB.plan.nav}
      title={tab === "jobs" ? "Position search" : SOAP_TAB.plan.title}
      subtitle={
        tab === "jobs"
          ? "Explore matched roles and saved positions alongside your career strategy."
          : SOAP_TAB.plan.description
      }
      maxWidth={tab === "jobs" ? "lg" : "md"}
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

      {tab === "goals" ? <GoalsWorkspace embedded /> : <JobsWorkspace embedded />}
    </PageShell>
  );
}

export function StrategyWorkspace() {
  return (
    <Suspense fallback={<p className="text-sm text-cx-forest-dark/70">Loading…</p>}>
      <StrategyWorkspaceInner />
    </Suspense>
  );
}
