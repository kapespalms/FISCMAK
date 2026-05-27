"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { HubSearch } from "@/components/uh-psych/HubSearch";
import { MakHelpChip } from "@/components/uh-psych/MakHelpChip";
import {
  EDUCATION_CATEGORIES,
  searchEducationDocuments,
  uhPsychProgram,
} from "@/lib/v2/programs/uh-residency-content";
import { makMessageForEducationCategory } from "@/lib/v2/uh-residency-mak-context";

export function EducationHubWorkspace() {
  const [query, setQuery] = useState("");
  const program = uhPsychProgram();
  const searchResults = useMemo(() => searchEducationDocuments(query), [query]);
  const isSearching = query.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
            {program?.institution_name ?? "University Hospitals"}
          </p>
          <h1 className="text-page-title">Psychiatry education hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-forest-dark/75">
            Landmark articles, psychopharmacology references, patient handouts, core readings, and the
            master elective spreadsheet.
          </p>
        </div>
        <Link
          href="/app/dashboard"
          className="text-sm font-medium text-cx-forest-dark underline-offset-2 hover:underline"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[200px] flex-1">
          <HubSearch
            value={query}
            onChange={setQuery}
            placeholder="Search articles, handouts, pharm…"
            id="education-hub-search"
          />
        </div>
        <Link
          href="/app/residency"
          className="shrink-0 rounded-lg border border-cx-forest-dark/15 px-3 py-2 text-sm font-medium text-cx-forest-dark hover:bg-white/80"
        >
          Residency hub
        </Link>
      </div>

      <MakHelpChip
        label="Ask Mak to find a reading"
        message="Help me find the right landmark article or patient handout on the psychiatry education hub."
      />

      {isSearching ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-cx-forest-dark">
            {searchResults.length} document{searchResults.length === 1 ? "" : "s"}
          </h2>
          <DocumentList
            documents={searchResults.map((d) => ({
              ...d,
              categoryLabel: d.categoryTitle,
            }))}
          />
        </section>
      ) : (
        EDUCATION_CATEGORIES.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-24 rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-cx-forest-dark">{category.title}</h2>
                <p className="mt-1 text-sm text-cx-forest-dark/70">{category.description}</p>
              </div>
              <MakHelpChip
                label="Ask Mak"
                message={makMessageForEducationCategory(category.title)}
              />
            </div>
            <div className="mt-4">
              <DocumentList
                documents={category.documents.map((d) => ({
                  ...d,
                  categoryLabel: category.title,
                }))}
              />
            </div>
          </section>
        ))
      )}
    </div>
  );
}

type DocRow = {
  id: string;
  title: string;
  href: string;
  filename: string;
  description?: string;
  categoryLabel?: string;
};

function DocumentList({ documents }: { documents: DocRow[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-cx-forest-dark/60">No documents match your search.</p>;
  }

  return (
    <ul className="divide-y divide-cx-forest-dark/10 rounded-xl border border-cx-forest-dark/10 bg-white">
      {documents.map((doc) => (
        <li key={doc.id}>
          <a
            href={doc.href}
            download={doc.filename}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 px-4 py-3 transition hover:bg-cx-forest-dark/[0.03]"
          >
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-cx-forest-dark/50" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-cx-forest-dark">{doc.title}</p>
              {doc.description && (
                <p className="mt-0.5 text-xs text-cx-forest-dark/60">{doc.description}</p>
              )}
              {doc.categoryLabel && (
                <p className="mt-0.5 text-xs text-cx-forest-dark/45">{doc.categoryLabel}</p>
              )}
            </div>
            <Download className="h-4 w-4 shrink-0 text-cx-forest-dark/40" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
