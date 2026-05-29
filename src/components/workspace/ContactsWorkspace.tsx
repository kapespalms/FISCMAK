"use client";

import Link from "next/link";
import { InstitutionalStaffDirectory } from "@/components/uh-psych/InstitutionalStaffDirectory";
import { uhPsychProgram } from "@/lib/v2/programs/uh-residency-content";

export function ContactsWorkspace() {
  const program = uhPsychProgram();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
            {program?.institution_name ?? "University Hospitals"}
          </p>
          <h1 className="text-page-title">Contacts</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-forest-dark/75">
            Program leadership, faculty, and staff directory.
          </p>
        </div>
        <Link
          href="/app/uh-psych"
          className="text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
        >
          ← Rotations
        </Link>
      </div>

      <InstitutionalStaffDirectory />

      <section className="rounded-xl border border-cx-forest-dark/12 bg-cx-forest-dark/[0.02] px-4 py-3">
        <p className="text-sm font-medium text-cx-forest-dark">On-call & pagers</p>
        <p className="mt-1 text-sm text-cx-forest-dark/70">
          Pager numbers are not in the staff directory export. Check QGenda for call assignments or
          the legacy resident site contact tables.
        </p>
        <p className="mt-2 text-xs text-cx-forest-dark/55">
          <Link href="/app/schedule?tab=call" className="font-medium underline-offset-2 hover:underline">
            Call schedule
          </Link>
          {" · "}
          <Link href="/app/schedule?tab=links" className="font-medium underline-offset-2 hover:underline">
            MedHub / QGenda links
          </Link>
        </p>
      </section>
    </div>
  );
}
