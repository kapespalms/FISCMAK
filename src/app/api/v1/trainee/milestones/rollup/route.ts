/**
 * GET /api/v1/trainee/milestones/rollup
 *
 * Aggregates the current resident's milestone_self_ratings by lattice_skill_index
 * (0–7, the FISCMAK SKILLS row axis) for a given reporting period.
 *
 * Returns 8 per-skill averages (null where unrated) + total counts from the
 * resident's ACGME framework. Used by the CCC prep lattice overlay.
 *
 * Reads only the authenticated user's own rows (RLS enforced).
 * No new schema — reads milestone_self_ratings and acgme_subcompetencies.
 */

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getAppUser, isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";
import { SKILLS } from "@/lib/constants";

export type MilestoneSkillRollup = {
  skill_index:  number;
  skill_name:   string;
  avg_level:    number | null;
  rated_count:  number;
  /** Total subcompetencies in this skill for the resident's framework. */
  total_count:  number;
};

export type MilestoneRollupResult = {
  period:              string;
  skills:              MilestoneSkillRollup[];
  total_rated:         number;
  total_subcompetencies: number;
};

function emptyRollup(period: string): MilestoneRollupResult {
  return {
    period,
    skills: (SKILLS as readonly string[]).map((name, i) => ({
      skill_index:  i,
      skill_name:   name,
      avg_level:    null,
      rated_count:  0,
      total_count:  0,
    })),
    total_rated: 0,
    total_subcompetencies: 0,
  };
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  if (auth.demo || !isSupabaseConfigured()) {
    return jsonOk(emptyRollup(period));
  }

  const supabase = await createClient();

  // Resolve the resident's framework slug so we can return per-skill total counts.
  const user = await getAppUser(auth.userId, false);
  let frameworkSlug: string | null = null;
  if (user) {
    const profile = normalizeSpecialtyProfile(user);
    const fw = resolveTraineeEvaluationFramework({
      career_stage:                  user.career_stage,
      base_specialty:                profile.base_specialty,
      subspecialty:                  profile.subspecialty,
      subspecialty_training_complete: profile.subspecialty_training_complete,
    });
    frameworkSlug = fw?.evaluation_primary_slug ?? null;
  }

  // Total subcompetencies per skill index for this framework.
  const totalBySkill = new Map<number, number>();
  if (frameworkSlug) {
    const { data: totals } = await supabase
      .from("acgme_subcompetencies")
      .select("lattice_skill_index")
      .eq("framework_slug", frameworkSlug);
    for (const row of totals ?? []) {
      const s = row.lattice_skill_index as number;
      totalBySkill.set(s, (totalBySkill.get(s) ?? 0) + 1);
    }
  }

  // Self-ratings grouped by lattice_skill_index (only rated rows, RLS owner-only).
  // lattice_skill_index was backfilled by scripts/seed-acgme-taxonomy.mjs.
  const { data: ratings } = await supabase
    .from("milestone_self_ratings")
    .select("lattice_skill_index, self_level")
    .eq("user_id", auth.userId)
    .eq("reporting_period", period)
    .not("self_level", "is", null)
    .not("lattice_skill_index", "is", null);

  const levelsBySkill = new Map<number, number[]>();
  for (const row of ratings ?? []) {
    const s = row.lattice_skill_index as number;
    const l = row.self_level as number;
    const arr = levelsBySkill.get(s) ?? [];
    arr.push(l);
    levelsBySkill.set(s, arr);
  }

  const skills: MilestoneSkillRollup[] = (SKILLS as readonly string[]).map((name, i) => {
    const levels = levelsBySkill.get(i) ?? [];
    const avg =
      levels.length > 0
        ? Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10
        : null;
    return {
      skill_index:  i,
      skill_name:   name,
      avg_level:    avg,
      rated_count:  levels.length,
      total_count:  totalBySkill.get(i) ?? 0,
    };
  });

  return jsonOk({
    period,
    skills,
    total_rated:          [...levelsBySkill.values()].reduce((s, a) => s + a.length, 0),
    total_subcompetencies: [...totalBySkill.values()].reduce((s, n) => s + n, 0),
  } satisfies MilestoneRollupResult);
}
