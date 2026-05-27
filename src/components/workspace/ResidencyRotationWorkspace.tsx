"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CollapsibleSection } from "@/components/uh-psych/CollapsibleSection";
import { MakHelpChip } from "@/components/uh-psych/MakHelpChip";
import {
  ROTATION_SECTION_LABELS,
  type ResidencyPageContent,
  type RotationSectionId,
} from "@/lib/v2/programs/uh-residency-content";
import { makMessageForResidencyPage } from "@/lib/v2/uh-residency-mak-context";

const SECTION_ORDER: RotationSectionId[] = [
  "prior-to-rotation",
  "overview",
  "location",
  "personnel",
  "schedule",
  "logistics",
  "resources",
];

type ResidencyRotationWorkspaceProps = {
  page: ResidencyPageContent;
};

export function ResidencyRotationWorkspace({ page }: ResidencyRotationWorkspaceProps) {
  const sections = SECTION_ORDER.filter((id) => {
    const items = page.sections[id];
    return items && items.length > 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/residency"
            className="text-xs font-medium text-cx-forest-dark/60 hover:text-cx-forest-dark"
          >
            ← Residency hub
          </Link>
          <h1 className="mt-1 text-page-title">{page.title}</h1>
          {page.subtitle && <p className="mt-1 text-sm text-cx-forest-dark/70">{page.subtitle}</p>}
          {page.lastUpdated && (
            <p className="mt-1 text-xs text-cx-forest-dark/50">Last updated {page.lastUpdated}</p>
          )}
          {!page.seeded && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Full guide migration in progress — Coach Mak can still help with orientation and debrief
              questions.
            </p>
          )}
        </div>
        <MakHelpChip label="Ask Mak about this rotation" message={makMessageForResidencyPage(page)} />
      </div>

      {page.overviewText && sections.length === 0 && (
        <p className="text-sm leading-relaxed text-cx-forest-dark/80">{page.overviewText}</p>
      )}

      <div className="space-y-3">
        {sections.map((sectionId, index) => {
          const items = page.sections[sectionId];
          if (!items?.length) return null;
          const isOverviewDuplicate =
            sectionId === "overview" && items.length === 1 && items[0] === page.overviewText;
          if (isOverviewDuplicate && sections.includes("overview") && page.overviewText) {
            // show overview section once in collapsible
          }
          return (
            <CollapsibleSection
              key={sectionId}
              id={sectionId}
              title={ROTATION_SECTION_LABELS[sectionId]}
              defaultOpen={index < 3}
            >
              <SectionList items={items} />
              {sectionId === "schedule" && page.slug === "call" && (
                <p className="mt-3 text-xs text-cx-forest-dark/60">
                  Call assignments: QGenda · Switch rules on resident drive
                </p>
              )}
            </CollapsibleSection>
          );
        })}
      </div>

      {page.driveFiles && page.driveFiles.length > 0 && (
        <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-cx-forest-dark">Drive resources</h2>
          <ul className="mt-3 space-y-2">
            {page.driveFiles.map((file) => (
              <li key={file.url}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
                >
                  {file.label}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="flex flex-wrap gap-2 border-t border-cx-forest-dark/10 pt-4 text-xs">
        <span className="text-cx-forest-dark/50">Jump to:</span>
        {sections.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-cx-forest-dark/15 px-2.5 py-0.5 text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
          >
            {ROTATION_SECTION_LABELS[id]}
          </a>
        ))}
      </nav>
    </div>
  );
}

function SectionList({ items }: { items: string[] }) {
  if (items.length === 1 && !items[0].includes("•") && items[0].length > 120) {
    return <p className="text-sm leading-relaxed text-cx-forest-dark/85">{items[0]}</p>;
  }
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-cx-forest-dark/85">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}