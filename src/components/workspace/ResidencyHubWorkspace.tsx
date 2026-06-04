"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, GraduationCap, Phone, MapPin } from "lucide-react";
import { HubSearch } from "@/components/uh-psych/HubSearch";
import { EnrichmentTracksSection } from "@/components/uh-psych/EnrichmentTracksSection";
import { MakHelpChip } from "@/components/uh-psych/MakHelpChip";
import {
  getResidencyPage,
  listAllResidencyPages,
  residencyHubCategories,
  residencyPageHref,
  searchResidencyHub,
  uhPsychProgram,
} from "@/lib/v2/programs/uh-residency-content";
import { ContentGapsSection } from "@/components/uh-psych/ContentGapsSection";
import { rotationTone } from "@/lib/v2/programs/rotation-catalog";

const JOB_CARDS = [
  {
    href: "/app/residency",
    icon: MapPin,
    title: "Rotations",
    description: "Where am I going?",
    current: true,
  },
  {
    href: "/app/schedule",
    icon: Calendar,
    title: "Schedule",
    description: "When am I on call?",
  },
  {
    href: "/app/education",
    icon: GraduationCap,
    title: "Read",
    description: "What should I read?",
  },
  {
    href: "/app/contacts",
    icon: Phone,
    title: "Contacts",
    description: "Who do I call?",
  },
] as const;

export function ResidencyHubWorkspace() {
  const [query, setQuery] = useState("");
  const program = uhPsychProgram();
  const categories = residencyHubCategories().filter((c) => c.id !== "program-admin");
  const rotationPages = useMemo(
    () => listAllResidencyPages().filter((p) => p.category === "rotation"),
    [],
  );
  const searchResults = useMemo(() => searchResidencyHub(query), [query]);
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
            {program?.institution_name ?? "University Hospitals"}
          </p>
          <h1 className="text-page-title">Rotations</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-text/75">
            Rotation guides, prep checklists, and site logistics.{" "}
            <Link
              href="/app/residency/electives"
              className="font-medium text-cx-text underline-offset-2 hover:underline"
            >
              Elective catalog
            </Link>
          </p>
        </div>
        <Link
          href="/app/dashboard"
          className="text-sm font-medium text-cx-text underline-offset-2 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {JOB_CARDS.map(({ href, icon: Icon, title, description, ...rest }) => {
          const isCurrent = "current" in rest && rest.current;
          const className = isCurrent
            ? "flex gap-3 rounded-xl border border-cx-forest-dark/25 bg-cx-forest-dark/[0.04] p-4"
            : "flex gap-3 rounded-xl border border-cx-forest-dark/15 bg-white/90 p-4 transition hover:border-cx-forest-dark/25 hover:shadow-sm";

          const inner = (
            <>
              <div className="text-cx-text/70">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cx-text">{title}</p>
                <p className="text-xs text-cx-text/60">{description}</p>
              </div>
            </>
          );

          return isCurrent ? (
            <div key={title} className={className}>
              {inner}
            </div>
          ) : (
            <Link key={title} href={href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>

      <HubSearch
        value={query}
        onChange={setQuery}
        placeholder="Search rotations, readings, electives…"
        id="residency-hub-search"
      />

      <div className="flex flex-wrap gap-2">
        <MakHelpChip
          label="Ask Mak about call"
          message="Where is the call schedule and what should I review before my call block at UH psychiatry?"
        />
        <MakHelpChip
          label="Prep for rotation"
          message="Help me prepare for my current rotation — link me to the right sections on the residency hub."
        />
      </div>

      {isSearching ? (
        <section className="space-y-4">
          {searchResults.length === 0 ? (
            <p className="text-sm text-cx-text/60">No matches — try a rotation name, topic, or elective.</p>
          ) : (
            searchResults.map((group) => (
              <div key={group.type}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cx-text/55">
                  {group.label} ({group.items.length})
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.type === "rotation" &&
                    group.items.map((page) => (
                      <li key={page.slug}>
                        <Link
                          href={residencyPageHref(page.slug)}
                          className="block rounded-xl border border-cx-forest-dark/10 px-4 py-3 text-sm hover:border-cx-forest-dark/25 hover:bg-white"
                        >
                          <span className="font-medium text-cx-text">{page.title}</span>
                          {!page.seeded && (
                            <span className="ml-2 text-xs text-cx-text/50">(coming soon)</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  {group.type === "reading" &&
                    group.items.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={doc.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-cx-forest-dark/10 px-4 py-3 text-sm hover:border-cx-forest-dark/25 hover:bg-white"
                        >
                          <span className="font-medium text-cx-text">{doc.title}</span>
                          <span className="mt-0.5 block text-xs text-cx-text/55">
                            {doc.categoryTitle}
                          </span>
                        </a>
                      </li>
                    ))}
                  {group.type === "elective" &&
                    group.items.map((entry) => (
                      <li key={entry.id}>
                        <Link
                          href={`/app/residency/electives?highlight=${encodeURIComponent(entry.id)}`}
                          className="block rounded-xl border border-cx-forest-dark/10 px-4 py-3 text-sm hover:border-cx-forest-dark/25 hover:bg-white"
                        >
                          <span className="font-medium text-cx-text">{entry.name}</span>
                          <span className="mt-0.5 block text-xs text-cx-text/55">
                            {entry.category}
                            {entry.location ? ` · ${entry.location}` : ""}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          )}
        </section>
      ) : (
        <>
          <section id="rotations" className="scroll-mt-24 space-y-5">
            <h2 className="text-sm font-semibold text-cx-text">
              {rotationPages.length} rotations
            </h2>
            {categories.map((category) => {
              const pages = category.pageSlugs
                .map((slug) => getResidencyPage(slug))
                .filter((p): p is NonNullable<typeof p> => p != null);
              if (pages.length === 0) return null;
              return (
                <div key={category.id}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cx-text/55">
                    {category.title}
                  </h3>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pages.map((page) => (
                      <li key={page.slug}>
                        <Link
                          href={residencyPageHref(page.slug)}
                          className={`block rounded-lg border px-3 py-2 text-sm transition hover:shadow-sm ${rotationTone(page.slug)}`}
                        >
                          <span className="font-medium">{page.title}</span>
                          {!page.seeded && (
                            <span className="mt-0.5 block text-xs opacity-70">Coming soon</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>

          <EnrichmentTracksSection showElectivesLink />
          <ContentGapsSection />
        </>
      )}
    </div>
  );
}
