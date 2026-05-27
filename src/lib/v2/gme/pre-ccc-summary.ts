import type { ParsedMedhubEvalRow } from "@/lib/v2/gme/medhub-csv-import";
import {
  type NarrativeSynthesis,
  synthesizeNarratives,
} from "@/lib/v2/gme/narrative-synthesis";

export type PreCccEvalSummary = {
  eval_id: string | null;
  rotation_name: string | null;
  supervisor_name: string | null;
  eval_date: string | null;
  form_name: string | null;
  milestone_average: number | null;
  milestone_lowest: { key: string; value: number } | null;
  narrative_excerpt: string | null;
};

export type PreCccSummary = {
  trainee_user_id: string | null;
  trainee_initials: string | null;
  pgy_level: string | null;
  reporting_period: string;
  generated_at: string;
  data_sufficiency: {
    eval_count: number;
    sufficient: boolean;
    note: string;
  };
  milestone_overview: {
    average_across_evals: number | null;
    evals_with_milestones: number;
  };
  evaluations: PreCccEvalSummary[];
  narrative_themes: string[];
  narrative_synthesis: NarrativeSynthesis;
  ilp_status: {
    draft_count: number;
    active_count: number;
    note: string;
  };
  disclaimer: string;
};

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function lowestMilestone(scores: Record<string, number>) {
  const entries = Object.entries(scores);
  if (!entries.length) return null;
  return entries.reduce(
    (min, [key, value]) => (value < min.value ? { key, value } : min),
    { key: entries[0][0], value: entries[0][1] },
  );
}

export function buildPreCccSummary(input: {
  traineeUserId?: string | null;
  traineeInitials?: string | null;
  pgyLevel?: string | null;
  reportingPeriod?: string;
  evaluations: ParsedMedhubEvalRow[];
  ilpGoals?: Array<{ status: string }>;
}): PreCccSummary {
  const evalSummaries: PreCccEvalSummary[] = input.evaluations.map((ev) => {
    const scoreValues = Object.values(ev.numeric_scores);
    return {
      eval_id: ev.eval_id ?? null,
      rotation_name: ev.rotation_name,
      supervisor_name: ev.supervisor_name,
      eval_date: ev.eval_date,
      form_name: ev.form_name,
      milestone_average: average(scoreValues),
      milestone_lowest: lowestMilestone(ev.numeric_scores),
      narrative_excerpt: ev.narrative_text?.slice(0, 280) ?? null,
    };
  });

  const milestoneAvgs = evalSummaries
    .map((e) => e.milestone_average)
    .filter((v): v is number => v != null);

  const evalsWithMilestones = input.evaluations.filter(
    (e) => Object.keys(e.numeric_scores).length > 0,
  ).length;

  const themes = new Set<string>();
  for (const ev of input.evaluations) {
    if (ev.narrative_text?.toLowerCase().includes("rapport")) themes.add("patient rapport");
    if (ev.narrative_text?.toLowerCase().includes("concise")) themes.add("documentation concision");
    if (ev.narrative_text?.toLowerCase().includes("diagnostic")) themes.add("diagnostic precision");
    if (ev.narrative_text?.toLowerCase().includes("treatment plan")) themes.add("treatment planning");
  }

  const count = input.evaluations.length;
  const sufficient = count >= 1;
  const synthesis = synthesizeNarratives(input.evaluations);
  const ilpGoals = input.ilpGoals ?? [];
  const draftCount = ilpGoals.filter((g) => g.status === "draft").length;
  const activeCount = ilpGoals.filter((g) => g.status === "active").length;

  return {
    trainee_user_id: input.traineeUserId ?? null,
    trainee_initials: input.traineeInitials ?? null,
    pgy_level: input.pgyLevel ?? null,
    reporting_period: input.reportingPeriod ?? "current",
    generated_at: new Date().toISOString(),
    data_sufficiency: {
      eval_count: count,
      sufficient,
      note: sufficient
        ? `${count} rotation evaluation(s) available for pre-CCC synthesis.`
        : "No imported evaluations — upload MedHub CSV before mock CCC.",
    },
    milestone_overview: {
      average_across_evals: average(milestoneAvgs),
      evals_with_milestones: evalsWithMilestones,
    },
    evaluations: evalSummaries,
    narrative_themes: [...themes],
    narrative_synthesis: synthesis,
    ilp_status: {
      draft_count: draftCount,
      active_count: activeCount,
      note:
        activeCount > 0
          ? `${activeCount} PD-approved ILP goal(s) on file.`
          : draftCount > 0
            ? `${draftCount} draft ILP goal(s) awaiting PD review.`
            : "No ILP goals recorded for this period.",
    },
    disclaimer:
      "AI-assisted synthesis from imported MedHub data — verify against original evaluations in MedHub.",
  };
}
