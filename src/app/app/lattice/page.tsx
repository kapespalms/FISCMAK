"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LatticeView } from "@/components/workspace/LatticeView";
import { LatticeListView } from "@/components/lattice/LatticeListView";

function LatticeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const view = (params.get("view") ?? "map") as "map" | "list";

  function setView(v: "map" | "list") {
    const p = new URLSearchParams(params.toString());
    p.set("view", v);
    router.replace(`/app/lattice?${p.toString()}`);
  }

  return (
    <div className="space-y-5">
      {/* Map | List toggle */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-cx-forest-dark">Lattice</h1>
        <div className="flex gap-0.5 rounded-lg border border-cx-forest-dark/10 bg-white/60 p-0.5">
          {(["map", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-medium transition-colors capitalize",
                view === v
                  ? "bg-cx-forest-dark text-white"
                  : "text-cx-forest-dark/70 hover:bg-cx-forest-dark/5",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? <LatticeView /> : <LatticeListView />}
    </div>
  );
}

export default function LatticePage() {
  return (
    <Suspense fallback={<div className="text-sm text-cx-forest-dark/50">Loading…</div>}>
      <LatticeContent />
    </Suspense>
  );
}
