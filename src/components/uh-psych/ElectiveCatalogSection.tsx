"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  electiveCatalogCoordination,
  listElectiveCategories,
  listElectiveCatalogEntries,
  searchElectiveCatalogEntries,
  type ElectiveCatalogEntry,
} from "@/lib/v2/programs/elective-catalog";
import { residencyPageHref } from "@/lib/v2/programs/uh-residency-content";

const TIMEFRAME_LABELS: Record<ElectiveCatalogEntry["timeframe"], string> = {
  block: "Block",
  longitudinal: "Longitudinal",
  either: "Block or longitudinal",
};

const PATIENT_CARE_LABELS: Record<ElectiveCatalogEntry["patient_care"], string> = {
  active: "Active",
  observational: "Observational",
  both: "Active & observational",
  na: "N/A",
};

export function ElectiveCatalogSection() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const coordination = electiveCatalogCoordination();
  const categories = listElectiveCategories();
  const total = listElectiveCatalogEntries().length;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [timeframe, setTimeframe] = useState<"all" | ElectiveCatalogEntry["timeframe"]>("all");
  const [patientCare, setPatientCare] = useState<"all" | ElectiveCatalogEntry["patient_care"]>("all");

  useEffect(() => {
    if (highlightId) {
      setQuery("");
      setCategory("all");
      requestAnimationFrame(() => {
        document.getElementById("catalog-highlight")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [highlightId]);

  const results = useMemo(
    () =>
      searchElectiveCatalogEntries(query, {
        category: category === "all" ? undefined : category,
        timeframe,
        patientCare,
      }),
    [query, category, timeframe, patientCare],
  );

  const displayResults = useMemo(() => {
    if (!highlightId) return results;
    const hit =
      listElectiveCatalogEntries().find((e) => e.id === highlightId) ??
      results.find((e) => e.id === highlightId);
    if (!hit) return results;
    return [hit, ...results.filter((e) => e.id !== highlightId)];
  }, [results, highlightId]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-5">
        <h2 className="text-base font-semibold text-cx-forest-dark">Elective process</h2>
        <dl className="mt-3 divide-y divide-cx-forest-dark/8 text-sm">
          <div className="grid gap-1 py-2 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
            <dt className="font-medium text-cx-forest-dark/70">PGY3/4 coordinator</dt>
            <dd>{coordination.pgy3_4_coordinator}</dd>
          </div>
          <div className="grid gap-1 py-2 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
            <dt className="font-medium text-cx-forest-dark/70">Requests</dt>
            <dd>{coordination.elective_request_contact}</dd>
          </div>
          <div className="grid gap-1 py-2 sm:grid-cols-[minmax(8rem,30%)_1fr] sm:gap-4">
            <dt className="font-medium text-cx-forest-dark/70">Deadline</dt>
            <dd>{coordination.deadline_weeks_before} weeks before start</dd>
          </div>
        </dl>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-cx-forest-dark/75">
          {coordination.process_notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-cx-forest-dark">Master catalog</h2>
            <p className="text-xs text-cx-forest-dark/60">
              {total} options · {displayResults.length} shown
              {highlightId ? " · catalog match highlighted" : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="min-w-[12rem] flex-1 text-xs font-medium text-cx-forest-dark/70">
            Search
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, location, faculty…"
              className="mt-1 block w-full rounded-lg border border-cx-forest-dark/15 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-cx-forest-dark/70">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block rounded-lg border border-cx-forest-dark/15 px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-cx-forest-dark/70">
            Timeframe
            <select
              value={timeframe}
              onChange={(e) =>
                setTimeframe(e.target.value as "all" | ElectiveCatalogEntry["timeframe"])
              }
              className="mt-1 block rounded-lg border border-cx-forest-dark/15 px-3 py-2 text-sm"
            >
              <option value="all">Any</option>
              <option value="block">Block</option>
              <option value="longitudinal">Longitudinal</option>
              <option value="either">Either</option>
            </select>
          </label>
          <label className="text-xs font-medium text-cx-forest-dark/70">
            Patient care
            <select
              value={patientCare}
              onChange={(e) =>
                setPatientCare(e.target.value as "all" | ElectiveCatalogEntry["patient_care"])
              }
              className="mt-1 block rounded-lg border border-cx-forest-dark/15 px-3 py-2 text-sm"
            >
              <option value="all">Any</option>
              <option value="active">Active</option>
              <option value="observational">Observational</option>
              <option value="both">Both</option>
              <option value="na">N/A</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cx-forest-dark/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-cx-forest-dark/10 bg-cx-forest-dark/[0.03]">
              <tr>
                <th className="px-3 py-2.5 font-semibold text-cx-forest-dark">Elective</th>
                <th className="px-3 py-2.5 font-semibold text-cx-forest-dark">Category</th>
                <th className="px-3 py-2.5 font-semibold text-cx-forest-dark">Location</th>
                <th className="px-3 py-2.5 font-semibold text-cx-forest-dark">Faculty</th>
                <th className="px-3 py-2.5 font-semibold text-cx-forest-dark">Timeframe</th>
                <th className="px-3 py-2.5 font-semibold text-cx-forest-dark">Care</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-cx-forest-dark/60">
                    No electives match your filters.
                  </td>
                </tr>
              ) : (
                displayResults.map((entry) => (
                  <tr
                    key={entry.id}
                    id={entry.id === highlightId ? "catalog-highlight" : undefined}
                    className={`border-b border-cx-forest-dark/5 align-top ${
                      entry.id === highlightId ? "bg-[#5FD65F]/10" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      {entry.rotation_code ? (
                        <Link
                          href={residencyPageHref(entry.rotation_code)}
                          className="font-medium text-cx-forest-dark underline-offset-2 hover:underline"
                        >
                          {entry.name}
                        </Link>
                      ) : (
                        <p className="font-medium text-cx-forest-dark">{entry.name}</p>
                      )}
                      {entry.notes && (
                        <p className="mt-0.5 text-xs text-cx-forest-dark/60">{entry.notes}</p>
                      )}
                      {entry.contact && (
                        <p className="mt-0.5 text-xs text-cx-forest-dark/55">{entry.contact}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-cx-forest-dark/80">{entry.category}</td>
                    <td className="px-3 py-2.5 text-cx-forest-dark/75">{entry.location ?? "—"}</td>
                    <td className="px-3 py-2.5 text-cx-forest-dark/75">
                      {entry.faculty?.join(", ") ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-cx-forest-dark/75">
                      {TIMEFRAME_LABELS[entry.timeframe]}
                      {entry.schedule ? (
                        <span className="mt-0.5 block text-xs text-cx-forest-dark/55">
                          {entry.schedule}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-cx-forest-dark/75">
                      {PATIENT_CARE_LABELS[entry.patient_care]}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
