"use client";

import { useEffect, useState } from "react";
import { PreCccSummaryPanel } from "@/components/gme/PreCccSummaryPanel";
import type { UserSurface } from "@/lib/v2/profile-contract";

/** Pre-CCC card — institutional trainees only (persona contract). */
export function TraineePreCccCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        const surfaces = (data.profile_contract?.user_surfaces ?? []) as UserSurface[];
        if (surfaces.includes("pre_ccc")) setShow(true);
      })
      .catch(() => undefined);
  }, []);

  if (!show) return null;

  return (
    <PreCccSummaryPanel
      self
      title="CCC prep snapshot"
      description="Your imported rotation evaluations — use with MedHub originals before semiannual review."
    />
  );
}
