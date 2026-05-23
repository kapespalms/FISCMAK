"use client";

import { useEffect, useState } from "react";
import { SectionGateEntry } from "@/components/layout/SectionGateEntry";
import { academicSectionGateGreeting } from "@/lib/v2/academic-profiles";
import type { MakFlowIntent } from "@/lib/mak-sections";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";

const SECTION_MAP: Partial<
  Record<MakFlowIntent, "subjective" | "objective" | "assessment" | "plan" | "output">
> = {
  discuss: "subjective",
  review: "objective",
  assess: "assessment",
  plan: "plan",
  create: "output",
};

export function AcademicSoapSectionGate({
  intent,
  enabled = true,
}: {
  intent: MakFlowIntent;
  enabled?: boolean;
}) {
  const [greeting, setGreeting] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled) return;
    void (async () => {
      try {
        const [profileRes, meRes] = await Promise.all([
          fetch("/api/v1/onboarding/touchpoint1"),
          fetch("/api/v1/users/me"),
        ]);
        const profile = await profileRes.json();
        const me = await meRes.json();
        const section = SECTION_MAP[intent];
        if (!section) return;
        const text = academicSectionGateGreeting({
          section,
          displayName: me.name ?? me.email ?? "there",
          profile: {
            setting: profile.practice_setting as PracticeSetting | null,
            level: profile.career_stage as CareerStage | null,
            rank: profile.academic_rank as AcademicRank | null,
            track: profile.primary_career_track,
          },
        });
        setGreeting(text);
      } catch {
        setGreeting(undefined);
      }
    })();
  }, [intent, enabled]);

  if (!enabled) return null;
  return <SectionGateEntry intent={intent} customGreeting={greeting} />;
}
