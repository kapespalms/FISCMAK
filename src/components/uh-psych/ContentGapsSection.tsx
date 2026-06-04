"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { listPendingDriveIdentifications } from "@/lib/v2/programs/uh-residency-content";

type ContentGapsSectionProps = {
  /** When true, show admin-oriented labels (electives footer). */
  admin?: boolean;
};

export function ContentGapsSection({ admin = false }: ContentGapsSectionProps) {
  const pending = listPendingDriveIdentifications();
  const [open, setOpen] = useState(false);

  if (pending.length === 0) return null;

  return (
    <section className="rounded-2xl border border-dashed border-cx-forest-dark/20 bg-cx-forest-dark/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-cx-text">Content gaps</p>
          <p className="mt-0.5 text-xs text-cx-text/60">
            {pending.length} Drive {pending.length === 1 ? "file" : "files"} pending export or identification
          </p>
        </div>
        <span className="text-xs font-medium text-cx-text/55">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <ul className="space-y-2 border-t border-cx-forest-dark/10 px-5 py-4">
          {pending.map((file) => {
            const isComingSoon = file.label.toLowerCase().includes("identify rotation");
            const isSyllabus = file.label.toLowerCase().includes("syllabus");
            return (
              <li
                key={file.url}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-cx-forest-dark/10 bg-white/80 px-3 py-2.5 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-cx-text">
                    {isComingSoon ? "Rotation guide (coming soon)" : file.label}
                  </p>
                  {admin && !isComingSoon && (
                    <p className="mt-0.5 truncate text-xs text-cx-text/50">{file.url}</p>
                  )}
                  {isSyllabus && (
                    <p className="mt-1 text-xs text-cx-text/60">
                      External Google Doc — export to repo when ready.
                    </p>
                  )}
                </div>
                {isSyllabus ? (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-cx-text underline-offset-2 hover:underline"
                  >
                    Open doc
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-cx-text/50">Coming soon</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
