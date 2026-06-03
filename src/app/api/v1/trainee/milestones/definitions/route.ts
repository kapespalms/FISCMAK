import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { resolveTraineeEvaluationFramework } from "@/lib/v2/gme/trainee-evaluation-framework";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ subcompetencies: [], primary_slug: null });
  }

  const profile = normalizeSpecialtyProfile(user);
  const framework = resolveTraineeEvaluationFramework({
    career_stage: user.career_stage,
    base_specialty: profile.base_specialty,
    subspecialty: profile.subspecialty,
    subspecialty_training_complete: profile.subspecialty_training_complete,
  });

  if (!framework) {
    return jsonOk({ subcompetencies: [], primary_slug: null });
  }

  // DB-first: read from acgme_subcompetencies seeded by migration 20260556.
  // Falls back to bundled JSON resolver if the DB returns empty (e.g. pre-seed).
  if (!auth.demo && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("acgme_subcompetencies")
      .select(
        "subcompetency_id, number, name, acgme_competency_key, medhub_form_flag, level_anchors, lattice_skill_index",
      )
      .eq("framework_slug", framework.evaluation_primary_slug)
      .order("number", { ascending: true });

    if (data && data.length > 0) {
      return jsonOk({
        primary_slug:      framework.primary_slug,
        primary_name:      framework.primary_specialty,
        milestone_status:  "seeded" as const,
        subcompetencies:   data.map((row) => ({
          id:                   row.subcompetency_id,
          number:               row.number,
          name:                 row.name,
          acgme_competency_key: row.acgme_competency_key,
          medhub_outpatient_form: row.medhub_form_flag ?? false,
          lattice_skill_index:  row.lattice_skill_index,
          ...(row.level_anchors ? { levels: row.level_anchors } : {}),
        })),
      });
    }
  }

  // Fallback: bundled JSON resolver (pre-seed or demo)
  return jsonOk({
    primary_slug:     framework.primary_slug,
    primary_name:     framework.primary_specialty,
    milestone_status: framework.milestone_status,
    subcompetencies:  framework.subcompetencies,
  });
}
