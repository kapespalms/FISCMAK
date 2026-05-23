"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppShell } from "@/components/layout/AppShell";
import {
  buildSkillTranslationGreeting,
  defaultSkillTranslation,
} from "@/lib/v2/goal-framework";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";

type Props = {
  setting?: PracticeSetting | null;
  level?: CareerStage | null;
  rank?: AcademicRank | null;
  track?: string | null;
  specialty?: string | null;
};

export function PlanActivationPanel({ setting, level, rank, track, specialty }: Props) {
  const { startMakFlow } = useAppShell();

  const academic = isAcademicContext({ setting, level })
    ? resolveAcademicProfile({ setting, level, rank, track })
    : null;

  function beginSkillTranslation() {
    startMakFlow("plan", "/app/plan", buildSkillTranslationGreeting(defaultSkillTranslation()));
  }

  function beginJobSearch() {
    startMakFlow(
      "plan",
      "/app/plan",
      `Let's explore academic job search options for ${specialty ?? "your specialty"} at the ${rank ?? level ?? "current"} stage. What type of role are you considering — same institution, external academic, or hybrid/community?`,
    );
  }

  return (
    <Card accent="green">
      <p className="text-xs font-semibold uppercase text-fiscmak-muted">P-2 · P-3 · Career transitions</p>
      <h2 className="mt-1 text-lg font-bold">
        {academic?.planLead ?? "Career strategy tools"}
      </h2>
      <p className="mt-2 text-sm text-fiscmak-muted">
        Skill translation and job search flows run through Coach Mak — no separate forms required.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={beginSkillTranslation}>
          Translate skills to new track
        </Button>
        <Button variant="secondary" onClick={beginJobSearch}>
          Explore academic job search
        </Button>
      </div>
      {academic && (
        <ul className="mt-4 space-y-1 text-sm text-fiscmak-muted">
          {academic.developmentExamples.slice(0, 3).map((ex) => (
            <li key={ex}>• {ex}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
