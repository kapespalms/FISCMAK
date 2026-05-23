import { Suspense } from "react";
import { DashboardWorkspace } from "@/components/workspace/DashboardWorkspace";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-cx-text-secondary">Loading dashboard…</p>}>
      <DashboardWorkspace />
    </Suspense>
  );
}
