"use client";

import { useEffect, useState } from "react";
import { MilestoneSelfRatingPanel } from "@/components/gme/MilestoneSelfRatingPanel";

/** Milestone self-rating + discrepancy for institutional trainees on Output Studio. */
export function TraineeMilestoneCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        const path = data.onboarding?.onboarding_path;
        if (path === "institutional") setShow(true);
      })
      .catch(() => undefined);
  }, []);

  if (!show) return null;

  return <MilestoneSelfRatingPanel />;
}
