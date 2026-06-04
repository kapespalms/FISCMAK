"use client";

import Link from "next/link";
import { rotationCatalogForProgram } from "@/lib/v2/programs/rotation-catalog";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

type RotationsCatalogWorkspaceProps = {
  programSlug: string;
};

export function RotationsCatalogWorkspace({ programSlug }: RotationsCatalogWorkspaceProps) {
  const program = getProgramBySlug(programSlug);
  if (!program) {
    return (
      <p className="text-sm text-cx-text/70">Program rotations catalog is not available.</p>
    );
  }

  const sections = rotationCatalogForProgram(program.rotations);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
            {program.institution_name}
          </p>
          <h1 className="text-page-title">{program.program_name} rotations</h1>
        </div>
        <Link href="/app/dashboard" className="text-sm font-medium text-cx-text underline-offset-2 hover:underline">
          ← Dashboard
        </Link>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
          <h2 className="text-lg font-semibold text-cx-text">{section.title}</h2>
          <p className="mt-2 text-sm text-cx-text/75">{section.description}</p>
          {section.rotations.length > 0 && (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {section.rotations.map((r) => (
                <li
                  key={r.code}
                  className="rounded-xl border border-cx-forest-dark/10 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium">{r.label}</span>
                  {r.category && (
                    <span className="mt-0.5 block text-xs capitalize text-cx-text/55">
                      {r.category.replace(/_/g, " ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
