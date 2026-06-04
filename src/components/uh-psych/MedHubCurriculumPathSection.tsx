import Link from "next/link";
import type { CurriculumMetaSummary } from "@/lib/v2/programs/rotation-curriculum";

export function MedHubCurriculumPathSection({ meta }: { meta: CurriculumMetaSummary }) {
  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
      <h2 className="text-base font-semibold text-cx-text">Curriculum objectives</h2>
      <p className="mt-2 text-sm text-cx-text/75">
        Milestone goals for this rotation are in MedHub — not duplicated here.
      </p>
      <p className="mt-3 text-sm font-medium text-cx-text">
        Find in MedHub → {meta.medhub_curriculum_path}
      </p>
      {meta.source === "shared_inpatient" && (
        <p className="mt-2 text-xs text-cx-text/55">
          Shares the inpatient psychiatry curriculum with VA CT6, Concord, SWG, and Northcoast.
        </p>
      )}
      {meta.effective_date && (
        <p className="mt-1 text-xs text-cx-text/50">Effective {meta.effective_date}</p>
      )}
      <p className="mt-3 text-xs text-cx-text/55">
        <Link href="/app/schedule?tab=links" className="font-medium underline-offset-2 hover:underline">
          MedHub login
        </Link>
        {" · "}
        Ask your coordinator if you need the sign-in URL.
      </p>
    </section>
  );
}
