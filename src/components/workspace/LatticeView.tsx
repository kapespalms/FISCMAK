"use client";

import { useState } from "react";
import { Grid3x3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardSection } from "@/components/ui/CardSection";
import { LatticeHeatmapV3 } from "@/components/lattice/LatticeHeatmapV3";
import { QuadrantSummaryV3 } from "@/components/lattice/QuadrantSummaryV3";
import { CellEvidenceDrawer } from "@/components/lattice/CellEvidenceDrawer";
import type { HeatmapCell } from "@/app/api/v1/lattice/heatmap/route";
import { LATTICE_MAK } from "@/lib/card-mak-prompts";

export function LatticeView() {
  const [drawerCell, setDrawerCell] = useState<HeatmapCell | null>(null);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden p-0 shadow-[0_4px_24px_-8px_rgba(32,32,29,0.12),0_16px_48px_-16px_rgba(32,32,29,0.08)]">
        <div className="border-b border-[#ECE8DF] px-6 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-cx-text/50">
            Evidence Density — click any cell to explore
          </p>
        </div>
        <div className="p-4 md:p-6">
          <LatticeHeatmapV3 onCellClick={(cell) => setDrawerCell(cell)} />
        </div>
      </Card>

      <QuadrantSummaryV3 />

      <CellEvidenceDrawer
        cell={drawerCell}
        onClose={() => setDrawerCell(null)}
      />

      <CardSection
        compact
        eyebrow="Career Map"
        title="8 domains × 8 tracks"
        description="Map skills and tasks from your profile, assessments, activities, schedule, and career documents onto your lattice."
        icon={Grid3x3}
        mak={LATTICE_MAK.overview}
      />
    </div>
  );
}
