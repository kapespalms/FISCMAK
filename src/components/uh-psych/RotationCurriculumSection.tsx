"use client";

import { CollapsibleSection } from "@/components/uh-psych/CollapsibleSection";
import {
  formatMilestoneTarget,
  MILESTONE_LABELS,
  type RotationCurriculum,
} from "@/lib/v2/programs/rotation-curriculum";

export function RotationCurriculumSection({ curriculum }: { curriculum: RotationCurriculum }) {
  const { rotation, pgy_tracks } = curriculum;

  return (
    <CollapsibleSection id="curriculum-goals" title="Curriculum & goals" defaultOpen={false}>
      <div className="space-y-4 text-sm text-cx-forest-dark/85">
        <dl className="divide-y divide-cx-forest-dark/8">
          <div className="grid gap-1 py-2 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
            <dt className="font-medium text-cx-forest-dark/70">MedHub path</dt>
            <dd>{rotation.medhub_curriculum_path}</dd>
          </div>
          {rotation.effective_date && (
            <div className="grid gap-1 py-2 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
              <dt className="font-medium text-cx-forest-dark/70">Effective</dt>
              <dd>{rotation.effective_date}</dd>
            </div>
          )}
          {rotation.sites?.length ? (
            <div className="grid gap-1 py-2 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
              <dt className="font-medium text-cx-forest-dark/70">Sites</dt>
              <dd>{rotation.sites.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>

        {pgy_tracks.map((track) => (
          <section key={track.pgy_level} className="rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.02] p-4">
            <h3 className="text-sm font-semibold text-cx-forest-dark">
              {track.pgy_level}
              {track.portal_track ? (
                <span className="ml-2 font-normal text-cx-forest-dark/60">({track.portal_track})</span>
              ) : null}
            </h3>
            {track.role && (
              <p className="mt-1 text-xs text-cx-forest-dark/65">{track.role}</p>
            )}

            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cx-forest-dark/10 text-cx-forest-dark/55">
                    <th className="py-2 pr-4 font-semibold">Competency</th>
                    <th className="py-2 font-semibold">Milestone targets</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(track.milestone_targets).map(([code, targets]) => (
                    <tr key={code} className="border-b border-cx-forest-dark/5 align-top">
                      <td className="py-2 pr-4 font-medium text-cx-forest-dark/80">
                        {MILESTONE_LABELS[code] ?? code}
                      </td>
                      <td className="py-2 text-cx-forest-dark/75">
                        {targets.map(formatMilestoneTarget).join(" · ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {track.other_competency_objectives?.length ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
                  Other objectives
                </p>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-cx-forest-dark/75">
                  {track.other_competency_objectives.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </CollapsibleSection>
  );
}
