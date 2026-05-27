"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type CollapsibleSectionProps = {
  id: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({
  id,
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-cx-forest-dark/15 bg-white/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        <h2 className="text-base font-semibold text-cx-forest-dark">{title}</h2>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-cx-forest-dark/50 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <div id={`${id}-panel`} className="border-t border-cx-forest-dark/10 px-5 pb-5 pt-3">
          {children}
        </div>
      )}
    </section>
  );
}
