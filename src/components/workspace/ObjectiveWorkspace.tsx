"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import { LatticeView } from "@/components/workspace/LatticeView";
import { ActivitiesView } from "@/components/workspace/ActivitiesView";
import { DocumentsView } from "@/components/workspace/DocumentsView";
import { CareerDataVaultPanel } from "@/components/workspace/CareerDataVaultPanel";
import { CareerDataReconcilePanel } from "@/components/workspace/CareerDataReconcilePanel";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { MilestoneLatticeRollup } from "@/components/gme/MilestoneLatticeRollup";

const TABS = [
  { id: "lattice",   label: "Lattice" },
  { id: "vault",     label: "Vault" },
  { id: "reconcile", label: "Reconcile" },
  { id: "activities", label: "Activities" },
  { id: "documents", label: "Documents" },
  { id: "ccc",       label: "CCC prep" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ObjectiveWorkspace() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId =
    tabParam === "activities" ||
    tabParam === "documents" ||
    tabParam === "vault"      ||
    tabParam === "reconcile"  ||
    tabParam === "ccc"
      ? tabParam
      : "lattice";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-cx-forest-dark/70">Loading…</p>;
  }

  return (
    <PageShell
      eyebrow={SOAP_TAB.objective.nav}
      title={SOAP_TAB.objective.title}
      subtitle={SOAP_TAB.objective.description}
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
        {tab === "lattice"   && <LatticeView />}
        {tab === "vault"     && <CareerDataVaultPanel />}
        {tab === "reconcile" && <CareerDataReconcilePanel />}
        {tab === "activities" && <ActivitiesView />}
        {tab === "ccc"       && <MilestoneLatticeRollup />}
        {tab === "documents" && (
          <>
            <DocumentsView />
            <p className="mt-4 text-center text-sm text-cx-forest-dark/65">
              <a href="/app/documents" className="font-medium underline">
                Open full Documents workspace →
              </a>
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}
