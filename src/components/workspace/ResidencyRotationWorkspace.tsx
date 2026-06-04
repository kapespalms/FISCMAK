"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CatalogMatchSection } from "@/components/uh-psych/CatalogMatchSection";
import { CollapsibleSection } from "@/components/uh-psych/CollapsibleSection";
import { ContentGapsSection } from "@/components/uh-psych/ContentGapsSection";
import { ElectiveCatalogSection } from "@/components/uh-psych/ElectiveCatalogSection";
import { EnrichmentTracksSection } from "@/components/uh-psych/EnrichmentTracksSection";
import { MakHelpChip } from "@/components/uh-psych/MakHelpChip";
import { MedHubCurriculumPathSection } from "@/components/uh-psych/MedHubCurriculumPathSection";
import { RelatedReadingSection } from "@/components/uh-psych/RelatedReadingSection";
import { RotationCurriculumSection } from "@/components/uh-psych/RotationCurriculumSection";
import {
  ROTATION_SECTION_LABELS,
  type ResidencyPageContent,
  type RotationSectionId,
} from "@/lib/v2/programs/uh-residency-content";
import { findElectivesForRotation } from "@/lib/v2/programs/elective-catalog";
import { mergeDriveFileLists } from "@/lib/v2/programs/uh-content-drive";
import {
  getCurriculumForRotation,
  getCurriculumMetaForRotation,
} from "@/lib/v2/programs/rotation-curriculum";
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

const LABELED_SECTIONS = new Set<RotationSectionId>(["location", "personnel"]);

type ResidencyRotationWorkspaceProps = {
  page: ResidencyPageContent;
};

export function ResidencyRotationWorkspace({ page }: ResidencyRotationWorkspaceProps) {
  const isElectivesPage = page.slug === "electives";
  const isClinicalSkillsPage = page.slug === "clinical-skills";
  const curriculum = getCurriculumForRotation(page.slug);
  const curriculumMeta = curriculum ? null : getCurriculumMetaForRotation(page.slug);
  const catalogMatches =
    !isElectivesPage && page.category === "rotation" ? findElectivesForRotation(page.slug) : [];
  const driveFiles = mergeDriveFileLists(page.driveFiles);

  const sections = SECTION_ORDER.filter((id) => {
    const items = page.sections[id];
    return items && items.length > 0;
  }).filter((id) => {
    if (isElectivesPage) return id === "prior-to-rotation" || id === "logistics";
    if (isClinicalSkillsPage) {
      return id === "prior-to-rotation" || id === "overview" || id === "schedule" || id === "resources";
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/uh-psych"
            className="text-xs font-medium text-cx-text/60 hover:text-cx-text"
          >
            ← Rotations
          </Link>
          <h1 className="mt-1 text-page-title">{page.title}</h1>
          {page.subtitle && <p className="mt-1 text-sm text-cx-text/70">{page.subtitle}</p>}
          {page.lastUpdated && (
            <p className="mt-1 text-xs text-cx-text/50">Last updated {page.lastUpdated}</p>
          )}
          {!page.seeded && (
            <p className="mt-2 rounded-lg bg-[#E7DEC9]/50 px-3 py-2 text-sm text-[#20201D]">
              Full guide migration in progress — Mak can still help with orientation and debrief
              questions.
            </p>
          )}
        </div>
        <MakHelpChip label="Ask Mak about this rotation" message={makMessageForResidencyPage(page)} />
      </div>

      {isElectivesPage && (
        <>
          <ElectiveCatalogSection />
          <EnrichmentTracksSection />
        </>
      )}

      {page.overviewText && sections.length === 0 && !isElectivesPage && (
        <p className="text-sm leading-relaxed text-cx-text/80">{page.overviewText}</p>
      )}

      <div className="space-y-3">
        {sections.map((sectionId) => {
          const items = page.sections[sectionId];
          if (!items?.length) return null;
          return (
            <CollapsibleSection
              key={sectionId}
              id={sectionId}
              title={ROTATION_SECTION_LABELS[sectionId]}
              defaultOpen={sectionId === "prior-to-rotation"}
            >
              <SectionContent sectionId={sectionId} items={items} overviewText={page.overviewText} />
              {sectionId === "schedule" && page.slug === "call" && (
                <p className="mt-3 text-xs text-cx-text/60">
                  <Link
                    href="/app/schedule?tab=call"
                    className="font-medium text-cx-text underline-offset-2 hover:underline"
                  >
                    Open CMC call schedule grid →
                  </Link>
                  {" · "}
                  Live switches in QGenda
                </p>
              )}
            </CollapsibleSection>
          );
        })}
      </div>

      {curriculum && <RotationCurriculumSection curriculum={curriculum} />}
      {!curriculum && curriculumMeta && <MedHubCurriculumPathSection meta={curriculumMeta} />}

      {page.category === "rotation" && !isElectivesPage && (
        <RelatedReadingSection rotationCode={page.slug} />
      )}

      {catalogMatches.length > 0 && (
        <CatalogMatchSection rotationCode={page.slug} entries={catalogMatches} />
      )}

      {driveFiles.length > 0 && (
        <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
          <h2 className="text-base font-semibold text-cx-text">Downloads</h2>
          <ul className="mt-3 space-y-2">
            {driveFiles.map((file) => (
              <li key={file.url}>
                <a
                  href={file.url}
                  {...(file.isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cx-text underline-offset-2 hover:underline"
                >
                  {file.label}
                  {file.isExternal && <ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isElectivesPage && <ContentGapsSection admin />}

      <nav className="flex flex-wrap gap-2 border-t border-cx-forest-dark/10 pt-4 text-xs">
        <span className="text-cx-text/50">Jump to:</span>
        {sections.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-cx-forest-dark/15 px-2.5 py-0.5 text-cx-text/80 hover:bg-cx-forest-dark/5"
          >
            {ROTATION_SECTION_LABELS[id]}
          </a>
        ))}
        {curriculum && (
          <a
            href="#curriculum-goals"
            className="rounded-full border border-cx-forest-dark/15 px-2.5 py-0.5 text-cx-text/80 hover:bg-cx-forest-dark/5"
          >
            Curriculum & goals
          </a>
        )}
        {curriculumMeta && !curriculum && (
          <span className="rounded-full border border-cx-forest-dark/15 px-2.5 py-0.5 text-cx-text/60">
            MedHub objectives
          </span>
        )}
      </nav>
    </div>
  );
}

function SectionContent({
  sectionId,
  items,
  overviewText,
}: {
  sectionId: RotationSectionId;
  items: string[];
  overviewText?: string;
}) {
  const isOverviewDuplicate =
    sectionId === "overview" && items.length === 1 && items[0] === overviewText;

  if (LABELED_SECTIONS.has(sectionId)) {
    return <LabeledRows items={items} />;
  }

  if (items.length === 1 && !items[0].includes("•") && items[0].length > 120) {
    return <p className="text-sm leading-relaxed text-cx-text/85">{items[0]}</p>;
  }

  if (isOverviewDuplicate && overviewText) {
    return <p className="text-sm leading-relaxed text-cx-text/85">{overviewText}</p>;
  }

  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-cx-text/85">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function parseLabeledItem(item: string): { label: string; value: string } | null {
  const separators = [" — ", " – ", " - "];
  for (const sep of separators) {
    const idx = item.indexOf(sep);
    if (idx > 0) {
      return { label: item.slice(0, idx).trim(), value: item.slice(idx + sep.length).trim() };
    }
  }
  const colonIdx = item.indexOf(": ");
  if (colonIdx > 0) {
    return { label: item.slice(0, colonIdx).trim(), value: item.slice(colonIdx + 2).trim() };
  }
  return null;
}

function LabeledRows({ items }: { items: string[] }) {
  const rows = items.map((item) => ({ item, parsed: parseLabeledItem(item) }));
  const allLabeled = rows.every((r) => r.parsed != null);

  if (!allLabeled) {
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-cx-text/85">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="divide-y divide-cx-forest-dark/8 text-sm">
      {rows.map(({ item, parsed }) => (
        <div key={item} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
          <dt className="font-medium text-cx-text/70">{parsed!.label}</dt>
          <dd className="text-cx-text/85">{parsed!.value}</dd>
        </div>
      ))}
    </dl>
  );
}
