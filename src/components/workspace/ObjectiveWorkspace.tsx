"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LatticeView } from "@/components/workspace/LatticeView";
import { ActivitiesView } from "@/components/workspace/ActivitiesView";
import { DocumentsView } from "@/components/workspace/DocumentsView";
import { CareerDataVaultPanel } from "@/components/workspace/CareerDataVaultPanel";
import { CareerDataReconcilePanel } from "@/components/workspace/CareerDataReconcilePanel";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";

const TABS = [
  { id: "lattice", label: "Lattice" },
  { id: "vault", label: "Vault" },
  { id: "reconcile", label: "Reconcile" },
  { id: "activities", label: "Activities" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ObjectiveWorkspace() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId =
    tabParam === "activities" ||
    tabParam === "documents" ||
    tabParam === "vault" ||
    tabParam === "reconcile"
      ? tabParam
      : "lattice";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-fiscmak-muted">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AcademicSoapSectionGate intent="review" />
      <div>
        <div>
          <h1 className="text-page-title">Career Data</h1>
          <p className="mt-1 text-sm text-fiscmak-muted">
            Verified career data from uploaded documents and public databases
          </p>
        </div>
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
      {tab === "vault" && <CareerDataVaultPanel />}
      {tab === "reconcile" && <CareerDataReconcilePanel />}
      {tab === "activities" && <ActivitiesView />}
      {tab === "documents" && <DocumentsView />}
    </div>
  );
}
