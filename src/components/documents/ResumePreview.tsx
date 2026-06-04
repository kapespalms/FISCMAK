"use client";

import { cn } from "@/lib/utils";
import type { ResumeContent, ResumeThemeKey } from "@/lib/v2/resume-content";

type ResumePreviewProps = {
  content: ResumeContent;
  themeKey: ResumeThemeKey;
  highlightBlockId?: string | null;
};

export function ResumePreview({ content, themeKey, highlightBlockId }: ResumePreviewProps) {
  const spacious = themeKey === "spacious";

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[520px] rounded-sm bg-white text-cx-forest-dark shadow-[0_8px_32px_rgba(36,59,49,0.12)]",
        spacious ? "px-10 py-12 text-[15px] leading-relaxed" : "px-7 py-8 text-[13px] leading-snug",
      )}
    >
      {content.blocks.map((block) => {
        const highlighted = highlightBlockId === block.id;
        const wrap = (children: React.ReactNode) => (
          <div
            key={block.id}
            className={cn(
              "rounded-md transition-colors",
              highlighted && "bg-[#E7DEC9]/50 ring-2 ring-[#6E93B8]/50",
              spacious ? "mb-6" : "mb-4",
            )}
          >
            {children}
          </div>
        );

        if (block.type === "header") {
          return wrap(
            <header className={spacious ? "mb-2 border-b border-cx-forest-dark/15 pb-4" : "mb-1 border-b border-cx-forest-dark/15 pb-3"}>
              <h1 className={cn("font-bold tracking-tight", spacious ? "text-2xl" : "text-xl")}>
                {block.name || "Your name"}
              </h1>
              {(block.credentials || block.specialty) && (
                <p className="mt-1 text-cx-forest-dark/80">
                  {[block.credentials, block.specialty].filter(Boolean).join(" · ")}
                </p>
              )}
              {(block.email || block.phone || block.location) && (
                <p className="mt-2 text-sm text-cx-forest-dark/65">
                  {[block.email, block.phone, block.location].filter(Boolean).join(" · ")}
                </p>
              )}
            </header>,
          );
        }

        if (block.type === "experience") {
          return wrap(
            <section>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{block.role || "Role"}</p>
                <p
                  className={cn(
                    "text-sm",
                    block.dates.incomplete ? "text-[#C28D6C]" : "text-cx-forest-dark/60",
                  )}
                >
                  {block.dates.display || (block.dates.incomplete ? "Dates needed" : "")}
                </p>
              </div>
              <p className="text-cx-forest-dark/75">
                {block.organization}
                {block.location ? ` · ${block.location}` : ""}
              </p>
              {block.bullets.length > 0 && (
                <ul className={cn("mt-2 list-disc pl-5 text-cx-forest-dark/85", spacious && "space-y-1")}>
                  {block.bullets.map((b, i) => (
                    <li key={`${block.id}-b-${i}`}>{b}</li>
                  ))}
                </ul>
              )}
            </section>,
          );
        }

        if (block.type === "education") {
          return wrap(
            <section>
              <p className="font-semibold">{block.degree || "Degree"}</p>
              <p className="text-cx-forest-dark/75">
                {block.institution}
                {block.location ? ` · ${block.location}` : ""}
              </p>
              <p
                className={cn(
                  "text-sm",
                  block.dates.incomplete ? "text-[#C28D6C]" : "text-cx-forest-dark/60",
                )}
              >
                {block.dates.display || (block.dates.incomplete ? "Dates needed" : "")}
              </p>
              {block.details && <p className="mt-1 text-cx-forest-dark/70">{block.details}</p>}
            </section>,
          );
        }

        if (block.type === "skills") {
          return wrap(
            <section>
              <p className="mb-1 font-semibold uppercase tracking-wide text-cx-forest-dark/80 text-xs">
                {block.label}
              </p>
              <p className="text-cx-forest-dark/85">{block.items.join(" · ") || "—"}</p>
            </section>,
          );
        }

        return null;
      })}
    </div>
  );
}
