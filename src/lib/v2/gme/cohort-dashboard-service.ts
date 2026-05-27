import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getSpecialtySubcompetencies } from "@/lib/v2/gme/acgme-specialty-registry";
import { buildCohortDashboard, type CohortDashboard } from "@/lib/v2/gme/cohort-dashboard";
import { loadSelfRatings, listProgramTraineeIds } from "@/lib/v2/gme/trainee-gme-data";

export async function buildProgramCohortDashboard(input: {
  programId: string;
  period?: string;
  demo?: boolean;
}): Promise<CohortDashboard> {
  const period = input.period ?? "current";
  const subcompetencies = getSpecialtySubcompetencies("psychiatry");

  if (!isSupabaseConfigured() || input.demo) {
    return buildCohortDashboard({ period, subcompetencies, trainees: [] });
  }

  const supabase = await createClient();
  const traineeIds = await listProgramTraineeIds(input.programId);

  const trainees = await Promise.all(
    traineeIds.map(async (userId) => {
      const [{ data: user }, { data: evals }, selfRatings] = await Promise.all([
        supabase
          .from("app_users")
          .select("pgy_level, onboarding_metadata")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("rotation_evaluations")
          .select("numeric_scores, narrative_text")
          .eq("program_id", input.programId)
          .eq("trainee_user_id", userId),
        loadSelfRatings(userId, false, period),
      ]);

      const meta = user?.onboarding_metadata as { trainee_initials?: string } | null;

      return {
        user_id: userId,
        initials: meta?.trainee_initials ?? null,
        pgy_level: user?.pgy_level ?? null,
        evaluations: evals ?? [],
        self_ratings: selfRatings,
      };
    }),
  );

  return buildCohortDashboard({ period, subcompetencies, trainees });
}
