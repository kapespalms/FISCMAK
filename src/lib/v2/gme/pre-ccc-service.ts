import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ParsedMedhubEvalRow } from "@/lib/v2/gme/medhub-csv-import";
import { buildPreCccSummary, type PreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";
import { loadIlpGoals } from "@/lib/v2/gme/trainee-gme-data";

export async function buildTraineePreCccSummary(input: {
  programId: string;
  traineeUserId: string;
  reportingPeriod?: string;
  demo?: boolean;
}): Promise<PreCccSummary> {
  const period = input.reportingPeriod ?? "current";

  if (!isSupabaseConfigured() || input.demo) {
    return buildPreCccSummary({
      traineeUserId: input.traineeUserId,
      reportingPeriod: period,
      evaluations: [],
      ilpGoals: [],
    });
  }

  const supabase = await createClient();
  const { data: evals } = await supabase
    .from("rotation_evaluations")
    .select(
      "eval_id, trainee_initials, pgy_level, rotation_name, supervisor_name, eval_date, form_name, numeric_scores, narrative_text",
    )
    .eq("program_id", input.programId)
    .eq("trainee_user_id", input.traineeUserId)
    .order("eval_date", { ascending: false });

  const { data: trainee } = await supabase
    .from("app_users")
    .select("pgy_level, onboarding_metadata")
    .eq("user_id", input.traineeUserId)
    .maybeSingle();

  const meta = trainee?.onboarding_metadata as { trainee_initials?: string } | null;
  const ilpGoals = await loadIlpGoals(input.traineeUserId, false, period);

  const evaluations: ParsedMedhubEvalRow[] = (evals ?? []).map((row) => ({
    eval_id: row.eval_id,
    form_name: row.form_name,
    form_version: null,
    trainee_initials: row.trainee_initials,
    pgy_level: row.pgy_level,
    supervisor_name: row.supervisor_name,
    rotation_name: row.rotation_name,
    eval_date: row.eval_date,
    narrative_text: row.narrative_text,
    numeric_scores: (row.numeric_scores ?? {}) as Record<string, number>,
    raw_row: {},
  }));

  return buildPreCccSummary({
    traineeUserId: input.traineeUserId,
    traineeInitials: meta?.trainee_initials ?? evaluations[0]?.trainee_initials ?? null,
    pgyLevel: trainee?.pgy_level ?? evaluations[0]?.pgy_level ?? null,
    reportingPeriod: period,
    evaluations,
    ilpGoals,
  });
}
