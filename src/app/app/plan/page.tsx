import { Suspense } from "react";
import { StrategyWorkspace } from "@/components/workspace/StrategyWorkspace";

export default function PlanPage() {
  return (
    <Suspense fallback={<p className="text-sm text-cx-forest-dark/70">Loading…</p>}>
      <StrategyWorkspace />
    </Suspense>
  );
}
