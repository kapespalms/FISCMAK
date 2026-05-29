"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, GraduationCap, Phone } from "lucide-react";
import { HubSearch } from "@/components/uh-psych/HubSearch";
import { EnrichmentTracksSection } from "@/components/uh-psych/EnrichmentTracksSection";
import { SemiAnnualReviewSection } from "@/components/uh-psych/SemiAnnualReviewSection";
import { ContentGapsSection } from "@/components/uh-psych/ContentGapsSection";
import { SchedulePositionBanner } from "@/components/calendar/SchedulePositionBanner";
import { MakHelpChip } from "@/components/uh-psych/MakHelpChip";
import {
  getResidencyPage,
  residencyPageHref,
  searchResidencyHub,
  uhPsychProgram,
} from "@/lib/v2/programs/uh-residency-content";
import {
  UH_PGY12_HUB_SECTIONS,
  UH_PGY34_HUB_SECTIONS,
  UH_PROGRAM_ADMIN_SLUGS,
} from "@/lib/v2/programs/uh-psych-hub-sections";
import { rotationTone } from "@/lib/v2/programs/rotation-catalog";

const QUICK_LINKS = [
  { href: "/app/schedule", icon: Calendar, label: "Schedule", detail: "Blocks + call" },
  { href: "/app/education", icon: GraduationCap, label: "Read", detail: "Articles & handouts" },
  { href: "/app/contacts", icon: Phone, label: "Contacts", detail: "Directory" },
] as const;

type TrainingTab = "pgy12" | "pgy34" | "admin";

function RotationGrid({ slugs }: { slugs: string[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {slugs.map((slug) => {
        const page = getResidencyPage(slug);
        if (!page) return null;
        return (
          <li key={slug}>
            <Link
              href={residencyPageHref(slug)}
              className={`block rounded-lg border px-3 py-2 text-sm transition hover:shadow-sm ${rotationTone(slug)}`}
            >
              <span className="font-medium">{page.title}</span>
              {!page.seeded && (
                <span className="mt-0.5 block text-xs opacity-70">Coming soon</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function UhPsychHubWorkspace() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TrainingTab>("pgy12");
  const program = uhPsychProgram();
  const searchResults = useMemo(() => searchResidencyHub(query), [query]);
  const isSearching = query.trim().length > 0;

  const hubSections =
    tab === "pgy12" ? UH_PGY12_HUB_SECTIONS : tab === "pgy34" ? UH_PGY34_HUB_SECTIONS : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
            {program?.institution_name ?? "University Hospitals"}
          </p>
          <h1 className="text-page-title">UH Psych Hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-forest-dark/75">
            Rotations, schedule, readings, and program requirements — one place for CMC psychiatry
            residents.
          </p>
        </div>
        <Link
          href="/app/dashboard"
          className="text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, detail }) => (
          <Link
            key={href}
            href={href}
            className="flex gap-3 rounded-xl border border-cx-forest-dark/15 bg-white/90 p-3 transition hover:border-cx-forest-dark/25 hover:shadow-sm"
          >
            <Icon className="mt-0.5 h-5 w-5 text-cx-forest-dark/60" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-cx-forest-dark">{label}</p>
              <p className="text-xs text-cx-forest-dark/60">{detail}</p>
            </div>
          </Link>
        ))}
      </div>

      <SchedulePositionBanner />

      <HubSearch
        value={query}
        onChange={setQuery}
        placeholder="Search rotations, readings, electives…"
        id="uh-psych-hub-search"
      />

      {!isSearching && (
        <>
          <SemiAnnualReviewSection />

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["pgy12", "PGY1 & PGY2"],
                ["pgy34", "PGY3 & PGY4"],
                ["admin", "Program admin"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`cx-nav-pill ${tab === id ? "cx-nav-pill-active" : "cx-nav-pill-inactive"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        <MakHelpChip
          label="Semi-annual prep"
          message="Help me prepare for my semi-annual review with Dr. Cerny or Dr. Hunt — CV, SMART goals, portfolio, and MedHub evals."
        />
        <MakHelpChip
          label="Prep for rotation"
          message="Help me prepare for my current rotation — link me to the right sections in the UH Psych Hub."
        />
      </div>

      {isSearching ? (
        <section className="space-y-4">
          {searchResults.length === 0 ? (
            <p className="text-sm text-cx-forest-dark/60">No matches — try a rotation name or topic.</p>
          ) : (
            searchResults.map((group) => (
              <div key={group.type}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
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
                          <span className="font-medium text-cx-forest-dark">{page.title}</span>
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
                          <span className="font-medium text-cx-forest-dark">{doc.title}</span>
                        </a>
                      </li>
                    ))}
                  {group.type === "elective" &&
                    group.items.map((entry) => (
                      <li key={entry.id}>
                        <Link
                          href={`/app/uh-psych/electives?highlight=${encodeURIComponent(entry.id)}`}
                          className="block rounded-xl border border-cx-forest-dark/10 px-4 py-3 text-sm hover:border-cx-forest-dark/25 hover:bg-white"
                        >
                          <span className="font-medium text-cx-forest-dark">{entry.name}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))
          )}
        </section>
      ) : tab === "admin" ? (
        <section className="space-y-5">
          <RotationGrid slugs={[...UH_PROGRAM_ADMIN_SLUGS]} />
          <Link
            href="/app/uh-psych/electives"
            className="inline-flex text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
          >
            Master elective catalog (62 options) →
          </Link>
          <EnrichmentTracksSection showElectivesLink={false} />
          <ContentGapsSection />
        </section>
      ) : (
        <section className="space-y-6">
          {hubSections.map((section) => (
            <div key={section.id}>
              <h2 className="mb-2 text-sm font-semibold text-cx-forest-dark">{section.title}</h2>
              <RotationGrid slugs={section.slugs} />
            </div>
          ))}
          {tab === "pgy34" && (
            <p className="text-sm text-cx-forest-dark/70">
              PGY3/4 weekly outpatient schedules are set every 6–12 months with your mentor. See{" "}
              <Link href="/app/schedule?tab=blocks" className="font-medium underline-offset-2 hover:underline">
                block calendar
              </Link>{" "}
              for longitudinal clinic assignments.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
