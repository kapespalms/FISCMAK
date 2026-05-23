"use client";

import { useRouter } from "next/navigation";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { DashboardMetricBar } from "@/components/dashboard/DashboardMetricBar";
import { MiniCareerMap } from "@/components/dashboard/MiniCareerMap";
import { StatusChip } from "@/components/ui/StatusChip";
import type { DashboardLatticeCell } from "@/lib/v2/dashboard-data";
import type { SoapBandSnapshot } from "@/lib/v2/dashboard-snapshot";
import { documentFreshnessClass } from "@/lib/v2/dashboard-snapshot";
import { cn } from "@/lib/utils";

type SoapDashboardBandsProps = {
  bands: SoapBandSnapshot[];
  latticeCells: DashboardLatticeCell[];
  glowCell?: { domainIndex: number; trackIndex: number } | null;
  onOpenBand: (intent: SoapBandSnapshot["flowIntent"], href: string) => void;
};

function SubjectiveBandContent({ band }: { band: SoapBandSnapshot }) {
  if (band.metrics?.length) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {band.metrics.map((m) => (
          <DashboardMetricBar key={m.id} {...m} />
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-1.5 text-sm text-cx-text">
      {band.lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

function ObjectiveBandContent({ band }: { band: SoapBandSnapshot }) {
  const router = useRouter();
  return (
    <div className="space-y-2 text-sm">
      {band.vaultSummary && (
        <p className="font-medium text-cx-text">{band.vaultSummary}</p>
      )}
      {band.changesSinceQuarter && (
        <p className="text-fm-strong">{band.changesSinceQuarter}</p>
      )}
      {band.pendingReviewCount != null && band.pendingReviewCount > 0 && (
        <p className="text-fm-developing">
          {band.pendingReviewCount} item{band.pendingReviewCount > 1 ? "s" : ""} pending review{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => router.push("/app/objective?tab=reconcile")}
          >
            Review →
          </button>
        </p>
      )}
      {band.certificationAlert && (
        <p className="text-fm-attention">{band.certificationAlert}</p>
      )}
    </div>
  );
}

function AssessmentBandContent({
  band,
  latticeCells,
  glowCell,
}: {
  band: SoapBandSnapshot;
  latticeCells: DashboardLatticeCell[];
  glowCell?: { domainIndex: number; trackIndex: number } | null;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[auto_1fr]">
      {band.showMiniMap && (
        <div className="shrink-0">
          <MiniCareerMap cells={latticeCells} href={band.href} glowCell={glowCell} />
        </div>
      )}
      <div className="space-y-2 text-sm">
        {band.strengths && band.strengths.length > 0 && (
          <p>
            <span className="font-medium">Strengths: </span>
            {band.strengths.join(", ")}
          </p>
        )}
        {band.developmentArea && (
          <p>
            <span className="font-medium">Development Area: </span>
            {band.developmentArea}
          </p>
        )}
        {band.careerAlignment && (
          <div>
            <p>
              Career Alignment: {band.careerAlignment.percent}% toward{" "}
              {band.careerAlignment.label}
            </p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cx-border/60">
              <div
                className="h-full rounded-full bg-fm-primary"
                style={{ width: `${band.careerAlignment.percent}%` }}
              />
            </div>
          </div>
        )}
        {band.advancementReadiness && (
          <p className="text-cx-text-secondary">
            Advancement Readiness: {band.advancementReadiness.met}/
            {band.advancementReadiness.total} criteria met for{" "}
            {band.advancementReadiness.label}
          </p>
        )}
      </div>
    </div>
  );
}

function PlanBandContent({ band }: { band: SoapBandSnapshot }) {
  if (!band.progress?.length) {
    return (
      <ul className="space-y-1.5 text-sm text-cx-text">
        {band.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-2">
      {band.progress.map((p, i) => (
        <div
          key={p.label}
          className={cn(
            "rounded-lg border border-cx-border/60 px-3 py-2",
            p.stalled && "border-l-4 border-l-fm-developing",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-cx-text">{p.label}</p>
            {p.status && p.status !== "stable" && <StatusChip status={p.status} />}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cx-border/60">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                p.status === "strong"
                  ? "bg-fm-strong"
                  : p.status === "needs_attention"
                    ? "bg-fm-attention"
                    : p.status === "developing"
                      ? "bg-fm-developing"
                      : "bg-fm-neutral",
              )}
              style={{ width: `${Math.min(100, Math.max(0, p.percent))}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-cx-text-secondary">{p.percent}%</p>
          {band.stalledGoalIndex === i && (
            <p className="mt-1 text-caption text-fm-developing">No milestone progress for 2 quarters</p>
          )}
        </div>
      ))}
      {band.nextMilestone && (
        <p className="text-sm text-cx-text-secondary">
          Next Milestone: {band.nextMilestone}
        </p>
      )}
    </div>
  );
}

function OutputBandContent({ band }: { band: SoapBandSnapshot }) {
  const router = useRouter();
  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2">
        {band.documentCards?.map((doc) => (
          <div
            key={doc.type}
            className="flex items-start gap-2 rounded-lg border border-cx-border/60 px-3 py-2"
          >
            <span
              className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", documentFreshnessClass(doc.freshness))}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{doc.title}</p>
              <p className="text-caption text-cx-text-secondary">{doc.detail}</p>
              {doc.actionLabel && (
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-fm-accent hover:underline"
                  onClick={() => router.push("/app/output")}
                >
                  {doc.actionLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {band.advancementReadiness && (
        <p className="mt-2 text-sm">
          {band.advancementReadiness.label}: {band.advancementReadiness.met}/
          {band.advancementReadiness.total} criteria met{" "}
          <button
            type="button"
            className="font-medium text-fm-accent hover:underline"
            onClick={() => router.push("/app/assessment")}
          >
            View Report →
          </button>
        </p>
      )}
    </div>
  );
}

function BandBody({
  band,
  latticeCells,
  glowCell,
}: {
  band: SoapBandSnapshot;
  latticeCells: DashboardLatticeCell[];
  glowCell?: { domainIndex: number; trackIndex: number } | null;
}) {
  switch (band.id) {
    case "subjective":
      return <SubjectiveBandContent band={band} />;
    case "objective":
      return <ObjectiveBandContent band={band} />;
    case "assessment":
      return (
        <AssessmentBandContent band={band} latticeCells={latticeCells} glowCell={glowCell} />
      );
    case "plan":
      return <PlanBandContent band={band} />;
    case "output":
      return <OutputBandContent band={band} />;
    default:
      return null;
  }
}

function BandCard({
  band,
  latticeCells,
  glowCell,
  onOpenBand,
  className,
}: {
  band: SoapBandSnapshot;
  latticeCells: DashboardLatticeCell[];
  glowCell?: { domainIndex: number; trackIndex: number } | null;
  onOpenBand: SoapDashboardBandsProps["onOpenBand"];
  className?: string;
}) {
  return (
    <DashboardSection
      title={
        band.newItemBadge
          ? `${band.letter} — ${band.title} (${band.newItemBadge})`
          : `${band.letter} — ${band.title}`
      }
      subtitle={band.subtitle}
      href={band.href}
      background={band.background}
      className={cn("relative min-h-0 snap-center", className)}
    >
      {band.newItemBadge != null && band.newItemBadge > 0 && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-fm-primary text-[10px] font-bold text-white">
          {band.newItemBadge}
        </span>
      )}
      {band.bandLead && (
        <p className="text-sm font-semibold text-cx-text">{band.bandLead}</p>
      )}
      {band.emphasis && (
        <p className="text-caption text-cx-text-secondary">{band.emphasis}</p>
      )}
      <BandBody band={band} latticeCells={latticeCells} glowCell={glowCell} />
      <button
        type="button"
        onClick={() => onOpenBand(band.flowIntent, band.href)}
        className="mt-auto pt-2 text-left text-sm font-medium text-fm-accent hover:underline"
      >
        {band.actionLabel} →
      </button>
    </DashboardSection>
  );
}

export function SoapDashboardBands({
  bands,
  latticeCells,
  glowCell,
  onOpenBand,
}: SoapDashboardBandsProps) {
  return (
    <>
      <div className="flex flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden">
        {bands.map((band) => (
          <BandCard
            key={band.id}
            band={band}
            latticeCells={latticeCells}
            glowCell={band.id === "assessment" ? glowCell : null}
            onOpenBand={onOpenBand}
            className="min-w-[88vw] shrink-0"
          />
        ))}
      </div>

      <div className="hidden flex-1 gap-3 md:grid md:grid-cols-2 lg:grid-cols-1">
        {bands.map((band) => {
          if (band.id === "assessment") {
            return (
              <div key={band.id} className="md:col-span-2 lg:col-span-1">
                <BandCard
                  band={band}
                  latticeCells={latticeCells}
                  glowCell={glowCell}
                  onOpenBand={onOpenBand}
                />
              </div>
            );
          }
          return (
            <BandCard
              key={band.id}
              band={band}
              latticeCells={latticeCells}
              onOpenBand={onOpenBand}
            />
          );
        })}
      </div>
    </>
  );
}
