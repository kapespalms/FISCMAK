import { Suspense } from "react";
import { DashboardWorkspace } from "@/components/workspace/DashboardWorkspace";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-fiscmak-muted">Loading dashboard…</p>}>
      <DashboardWorkspace />
    </Suspense>
  );
}
