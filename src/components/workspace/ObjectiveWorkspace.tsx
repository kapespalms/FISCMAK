"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
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
    return <p className="text-sm text-cx-text-secondary">Loading…</p>;
  }

  return (
    <PageShell
      eyebrow="Verified career data"
      title="Career Data"
      subtitle="From uploaded documents and public databases"
      maxWidth="full"
    >
      <AcademicSoapSectionGate intent="review" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app/objective?tab=${id}`}
            className={cn(
              "cx-nav-pill",
              tab === id ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="cx-section-surface">
        {tab === "lattice" && <LatticeView />}
        {tab === "vault" && <CareerDataVaultPanel />}
        {tab === "reconcile" && <CareerDataReconcilePanel />}
        {tab === "activities" && <ActivitiesView />}
        {tab === "documents" && <DocumentsView />}
      </div>
    </PageShell>
  );
}
