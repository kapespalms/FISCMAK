"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { DualLatticeGrid } from "@/components/lattice/DualLatticeGrid";
import { LATTICE_MAK } from "@/lib/card-mak-prompts";
import type { LatticeDashboardResponse, LatticeTimeframe } from "@/lib/v2/lattice/types";
import { cn } from "@/lib/utils";

const TIMEFRAME_OPTIONS: { value: LatticeTimeframe; label: string }[] = [
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "1y", label: "1 year" },
  { value: "all", label: "All time" },
];

function LatticeLegend({ kind }: { kind: "fiscmak" | "acgme" }) {
  const quantityLabel =
    kind === "fiscmak"
      ? "Quantity (forest green, light → dark)"
      : "Quantity (lime → teal → navy)";
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-cx-forest-dark/65">
      <span>{quantityLabel}</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-3 rounded ring-2 ring-[#C9A227]/80" /> Gold = energizing
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-3 w-3 rounded ring-2 ring-[#CC5500]/75" /> Burnt orange = draining
      </span>
      <span>Empty cells: light gray, smaller · Active: glow, larger</span>
    </div>
  );
}

export function LatticeView() {
  const [data, setData] = useState<LatticeDashboardResponse | null>(null);
  const [timeframe, setTimeframe] = useState<LatticeTimeframe>("90d");
  const [tab, setTab] = useState<"fiscmak" | "acgme">("fiscmak");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (tf: LatticeTimeframe) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/lattice?timeframe=${tf}`);
      if (!res.ok) throw new Error("Could not load lattice");
      const json = (await res.json()) as LatticeDashboardResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(timeframe);
  }, [load, timeframe]);

  useEffect(() => {
    const onUpdate = () => void load(timeframe);
    window.addEventListener("fiscmak:activity-logged", onUpdate);
    window.addEventListener("fiscmak:document-uploaded", onUpdate);
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    return () => {
      window.removeEventListener("fiscmak:activity-logged", onUpdate);
      window.removeEventListener("fiscmak:document-uploaded", onUpdate);
      window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
    };
  }, [load, timeframe]);

  const showAcgme = Boolean(data?.is_trainee && data.acgme);
  const activeModel =
    tab === "acgme" && data?.acgme ? data.acgme : data?.fiscmak ?? null;

  const description = data
    ? `${data.evidence_total} mapped items (${data.activity_evidence_count} activities, ${data.document_evidence_count} from documents). All counts are relative to you in the selected window.`
    : "Map skills and tasks from activities and career documents onto your lattice.";

  return (
    <div className="space-y-4">
      <CardSection
        compact
        eyebrow="Career Map"
        title={showAcgme ? "FISCMAK & ACGME lattices" : "8 domains × 8 tracks"}
        description={description}
        icon={Grid3x3}
        mak={LATTICE_MAK.overview}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-cx-forest-dark/10 bg-white/60 p-1">
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimeframe(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                timeframe === opt.value
                  ? "bg-cx-forest-dark text-white"
                  : "text-cx-forest-dark/70 hover:bg-cx-forest-dark/5",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {showAcgme ? (
          <div className="flex gap-1 rounded-lg border border-cx-forest-dark/10 bg-white/60 p-1">
            <button
              type="button"
              onClick={() => setTab("fiscmak")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                tab === "fiscmak"
                  ? "bg-cx-forest-dark text-white"
                  : "text-cx-forest-dark/70 hover:bg-cx-forest-dark/5",
              )}
            >
              FISCMAK
            </button>
            <button
              type="button"
              onClick={() => setTab("acgme")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                tab === "acgme"
                  ? "bg-cx-forest-dark text-white"
                  : "text-cx-forest-dark/70 hover:bg-cx-forest-dark/5",
              )}
            >
              ACGME
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-cx-forest-dark/70">Loading lattice…</p>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : activeModel ? (
        <>
          <LatticeLegend kind={activeModel.kind} />
          <DualLatticeGrid model={activeModel} />
          <p className="text-xs text-cx-forest-dark/55">
            Tap any square for a detail card with mapped activities and document excerpts. Cross-mapping
            is allowed when content matches the skills/tasks ontology.
          </p>
        </>
      ) : null}
    </div>
  );
}
