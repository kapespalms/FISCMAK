import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { getSpecialtySubcompetencies } from "@/lib/v2/gme/acgme-specialty-registry";
import {
  expectedMilestoneLevelForPgy,
  heatmapCellFlag,
  HEATMAP_CELL_STYLES,
} from "@/lib/v2/gme/pgy-milestone-benchmarks";
import { aggregateExternalRatings } from "@/lib/v2/gme/medhub-milestone-map";
import { listReportingPeriods } from "@/lib/v2/gme/reporting-periods";
import {
  loadRotationEvaluations,
  loadSelfRatings,
  resolveTraineeProgramId,
} from "@/lib/v2/gme/trainee-gme-data";
import { normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const medhubOnly = searchParams.get("medhub_only") === "true";

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ periods: [] });
  }

  normalizeSpecialtyProfile(user);
  const subcompetencies = getSpecialtySubcompetencies("psychiatry").filter(
    (s) => !medhubOnly || s.medhub_outpatient_form,
  );
  const expected = expectedMilestoneLevelForPgy(user.pgy_level);
  const programId = resolveTraineeProgramId(user);
  const evaluations = programId
    ? await loadRotationEvaluations(auth.userId, programId)
    : [];
  const externalMap = aggregateExternalRatings(evaluations);

  const periods = await Promise.all(
    listReportingPeriods().map(async (period) => {
      const selfRatings = await loadSelfRatings(auth.userId, auth.demo, period.id);
      const selfMap = new Map(
        selfRatings
          .filter((r) => r.self_level != null)
          .map((r) => [r.subcompetency_id, r.self_level as number]),
      );

      const cells = subcompetencies.map((sub) => {
        const external = externalMap.get(sub.id) ?? null;
        const self = selfMap.get(sub.id) ?? null;
        const level = external ?? self;
        const flag = heatmapCellFlag(level, expected);
        return {
          subcompetency_id: sub.id,
          number: sub.number,
          name: sub.name,
          external_level: external,
          self_level: self,
          expected_level: expected,
          flag,
          style: HEATMAP_CELL_STYLES[flag],
        };
      });

      const rated = cells.filter((c) => c.external_level != null || c.self_level != null).length;

      return {
        period_id: period.id,
        period_label: period.label,
        rated_count: rated,
        total_count: cells.length,
        cells,
      };
    }),
  );

  return jsonOk({
    pgy_level: user.pgy_level,
    eval_count: evaluations.length,
    periods,
  });
}
