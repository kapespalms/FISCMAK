import { Suspense } from "react";
import { ObjectiveWorkspace } from "@/components/workspace/ObjectiveWorkspace";

export default function ObjectivePage() {
  return (
    <Suspense fallback={<p className="text-sm text-cx-text-secondary">Loading…</p>}>
      <ObjectiveWorkspace />
    </Suspense>
  );
}
