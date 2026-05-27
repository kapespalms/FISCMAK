"use client";

import { useEffect, useState } from "react";
import { PreCccSummaryPanel } from "@/components/gme/PreCccSummaryPanel";

/** Pre-CCC card for institutional trainees on Output Studio. */
export function TraineePreCccCard() {
  const [programSlug, setProgramSlug] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/v1/users/me").then((r) => r.json()),
      fetch("/api/v1/onboarding/touchpoint1").then((r) => r.json()),
    ])
      .then(([me, onboarding]) => {
        const path = onboarding.onboarding?.onboarding_path;
        const slug = onboarding.onboarding?.program_slug;
        if (path === "institutional" && slug) {
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
