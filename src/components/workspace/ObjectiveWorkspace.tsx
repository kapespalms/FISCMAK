"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LatticeView } from "@/components/workspace/LatticeView";
import { ActivitiesView } from "@/components/workspace/ActivitiesView";
import { DocumentsView } from "@/components/workspace/DocumentsView";

const TABS = [
  { id: "lattice", label: "Lattice" },
  { id: "activities", label: "Activities" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ObjectiveWorkspace() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId =
    tabParam === "activities" || tabParam === "documents" ? tabParam : "lattice";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-fiscmak-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Objective: Activities & evidence</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Lattice, activity log, and document uploads — updated as you work with Mak
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-fiscmak-border pb-2">
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app/objective?tab=${id}`}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-fiscmak-green-light text-fiscmak-green-dark"
                : "text-fiscmak-muted hover:bg-fiscmak-subtle",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      {tab === "lattice" && <LatticeView />}
      {tab === "activities" && <ActivitiesView />}
      {tab === "documents" && <DocumentsView />}
    </div>
  );
}
