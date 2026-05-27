"use client";

import { useEffect, useState } from "react";
import { MilestoneSelfRatingPanel } from "@/components/gme/MilestoneSelfRatingPanel";
import type { UserSurface } from "@/lib/v2/profile-contract";

/** Milestone self-rating + discrepancy — institutional trainees only (persona contract). */
export function TraineeMilestoneCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        const surfaces = (data.profile_contract?.user_surfaces ?? []) as UserSurface[];
        if (surfaces.includes("milestone_self_rating")) setShow(true);
      })
      .catch(() => undefined);
  }, []);

  if (!show) return null;

  return <MilestoneSelfRatingPanel />;
}
