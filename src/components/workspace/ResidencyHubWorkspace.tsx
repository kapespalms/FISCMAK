"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, GraduationCap, BookOpen, Phone } from "lucide-react";
import { HubSearch } from "@/components/uh-psych/HubSearch";
import { MakHelpChip } from "@/components/uh-psych/MakHelpChip";
import {
  getResidencyPage,
  residencyHubCategories,
  residencyPageHref,
  searchResidencyPages,
  uhPsychProgram,
} from "@/lib/v2/programs/uh-residency-content";
import { rotationTone } from "@/lib/v2/programs/rotation-catalog";

export function ResidencyHubWorkspace() {
  const [query, setQuery] = useState("");
  const program = uhPsychProgram();
  const categories = residencyHubCategories();
  const searchResults = useMemo(() => searchResidencyPages(query), [query]);
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
            {program?.institution_name ?? "University Hospitals"}
          </p>
          <h1 className="text-page-title">Psychiatry residency hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-forest-dark/75">
            Rotations, call, contacts, and program logistics — organized by topic. Each rotation uses
            the same sections: prior to rotation, overview, location, personnel, schedule, logistics,
            resources.
          </p>
        </div>
        <Link
          href="/app/dashboard"
          className="text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLinkCard
          href="/app/education"
          icon={<GraduationCap className="h-5 w-5" />}
          title="Education hub"
          description="Articles, pharm, patient handouts"
        />
        <QuickLinkCard
          href="/app/calendar"
          icon={<Calendar className="h-5 w-5" />}
          title="Block schedule"
          description="Full calendar view"
        />
        <QuickLinkCard
          href="/app/residency/call-schedule"
          icon={<Phone className="h-5 w-5" />}
          title="Call schedule"
          description="CMC coverage grid"
        />
        <QuickLinkCard
          href="/app/residency/contacts-calendars"
          icon={<Phone className="h-5 w-5" />}
          title="Contacts & calendars"
          description="MedHub, QGenda, staff"
        />
        <QuickLinkCard
          href="/app/education"
          icon={<BookOpen className="h-5 w-5" />}
          title="Elective spreadsheet"
          description="Master catalog (Education)"
        />
      </div>

      <HubSearch
        value={query}
        onChange={setQuery}
        placeholder="Search rotations, call, contacts…"
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
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-cx-forest-dark">
            {searchResults.length} result{searchResults.length === 1 ? "" : "s"}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {searchResults.map((page) => (
              <li key={page.slug}>
                <Link
                  href={residencyPageHref(page.slug)}
                  className="block rounded-xl border border-cx-forest-dark/10 px-4 py-3 text-sm hover:border-cx-forest-dark/25 hover:bg-white"
                >
                  <span className="font-medium text-cx-forest-dark">{page.title}</span>
                  {!page.seeded && (
                    <span className="ml-2 text-xs text-cx-forest-dark/50">(guide coming soon)</span>
                  )}
                  {page.overviewText && (
                    <p className="mt-1 line-clamp-2 text-xs text-cx-forest-dark/65">{page.overviewText}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        categories.map((category) => (
          <section
            key={category.id}
            className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5"
          >
            <h2 className="text-lg font-semibold text-cx-forest-dark">{category.title}</h2>
            <p className="mt-1 text-sm text-cx-forest-dark/70">{category.description}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {category.pageSlugs.map((slug) => {
                const page = getResidencyPage(slug);
                if (!page) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={residencyPageHref(slug)}
                      className={`flex flex-col rounded-xl border px-3 py-2.5 text-sm transition hover:shadow-sm ${rotationTone(slug)}`}
                    >
                      <span className="font-medium">{page.title}</span>
                      {!page.seeded && (
                        <span className="mt-0.5 text-xs opacity-70">Guide coming soon</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-xl border border-cx-forest-dark/15 bg-white/90 p-4 transition hover:border-cx-forest-dark/25 hover:shadow-sm"
    >
      <div className="text-cx-forest-dark/70">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-cx-forest-dark">{title}</p>
        <p className="text-xs text-cx-forest-dark/60">{description}</p>
      </div>
    </Link>
  );
}
