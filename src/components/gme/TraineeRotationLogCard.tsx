"use client";

import { useEffect, useState } from "react";
import { RotationLogPanel } from "@/components/gme/RotationLogPanel";
import type { UserSurface } from "@/lib/v2/profile-contract";

/** Rotation log — institutional trainees with schedule surface (persona contract). */
export function TraineeRotationLogCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        const surfaces = (data.profile_contract?.user_surfaces ?? []) as UserSurface[];
        if (surfaces.includes("schedule")) setShow(true);
      })
      .catch(() => undefined);
  }, []);

  if (!show) return null;

  return (
    <RotationLogPanel
      title="Current rotation"
      description="Log your block rotation — this feeds your training timeline and Mak context for CCC prep."
    />
  );
}
