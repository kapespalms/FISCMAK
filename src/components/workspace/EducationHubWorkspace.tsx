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
            {EDUCATION_CATEGORIES.reduce((n, c) => n + c.documents.length, 0)} documents across landmark
            articles, psychopharmacology, patient handouts, core readings, and electives.
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
              <CategoryDocuments category={category} />
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
  subcategory?: string;
  categoryLabel?: string;
};

function CategoryDocuments({
  category,
}: {
  category: (typeof EDUCATION_CATEGORIES)[number];
}) {
  const groups = useMemo(() => {
    const bySub = new Map<string, DocRow[]>();
    for (const doc of category.documents) {
      const key = doc.subcategory ?? "";
      const row: DocRow = { ...doc, categoryLabel: category.title };
      const list = bySub.get(key) ?? [];
      list.push(row);
      bySub.set(key, list);
    }
    return [...bySub.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [category]);

  if (groups.length === 1 && groups[0][0] === "") {
    return <DocumentList documents={groups[0][1]} />;
  }

  return (
    <div className="space-y-5">
      {groups.map(([subcategory, documents]) => (
        <div key={subcategory || "root"}>
          {subcategory ? (
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
              {subcategory}
            </h3>
          ) : null}
          <DocumentList documents={documents} />
        </div>
      ))}
    </div>
  );
}

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
              {(doc.subcategory || doc.categoryLabel) && (
                <p className="mt-0.5 text-xs text-cx-forest-dark/45">
                  {[doc.subcategory, doc.categoryLabel].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <Download className="h-4 w-4 shrink-0 text-cx-forest-dark/40" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
