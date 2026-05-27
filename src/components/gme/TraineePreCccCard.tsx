"use client";

import { useEffect, useState } from "react";
import { PreCccSummaryPanel } from "@/components/gme/PreCccSummaryPanel";
import type { UserSurface } from "@/lib/v2/profile-contract";

/** Pre-CCC card — institutional trainees only (persona contract). */
export function TraineePreCccCard() {
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/v1/users/me").then((r) => r.json()),
      fetch("/api/v1/onboarding/touchpoint1").then((r) => r.json()),
    ])
      .then(([me, onboarding]) => {
        const surfaces = (onboarding.profile_contract?.user_surfaces ?? []) as UserSurface[];
        const slug = onboarding.onboarding?.program_slug;
        if (surfaces.includes("pre_ccc") && slug) {
          setProgramSlug(slug);
          setUserId(me.user_id ?? null);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!programSlug || !userId) return null;

  return (
    <PreCccSummaryPanel
      programSlug={programSlug}
      userId={userId}
      title="CCC prep snapshot"
      description="Your imported rotation evaluations — use with MedHub originals before semiannual review."
    />
  );
}
