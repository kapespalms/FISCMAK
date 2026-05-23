"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const academic = isAcademicContext({ setting, level })
    ? resolveAcademicProfile({ setting, level, rank, track })
    : null;

  function beginSkillTranslation() {
    startMakFlow("plan", "/app/plan", buildSkillTranslationGreeting(defaultSkillTranslation()));
  }

  async function beginJobSearch() {
    await fetch("/api/v1/jobs/activate", { method: "POST" });
    startMakFlow(
      "plan",
      "/app/jobs",
      `Position search is active. I found matches aligned with ${specialty ?? "your specialty"} at the ${rank ?? level ?? "current"} stage. Which roles interest you most — same institution, external academic, or hybrid?`,
    );
    router.push("/app/jobs");
  }

  return (
    <Card accent="green">
      <p className="text-cx-label uppercase">P-2 · P-3 · Career transitions</p>
      <h2 className="mt-1 text-cx-h3">{academic?.planLead ?? "Career strategy tools"}</h2>
      <p className="mt-2 text-cx-body">
        Skill translation and job search flows run through Coach Mak — no separate forms required.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={beginSkillTranslation}>
          Translate skills to new track
        </Button>
        <Button variant="secondary" onClick={() => void beginJobSearch()}>
          Activate position search
        </Button>
      </div>
      {academic && (
        <ul className="mt-4 space-y-1 text-sm text-cx-text-secondary">
          {academic.developmentExamples.slice(0, 3).map((ex) => (
            <li key={ex}>• {ex}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}
