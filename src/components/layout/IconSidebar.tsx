"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { CoachMakMark } from "@/components/brand/CoachMakMark";

/** Slim left rail — Coach Mak toggle; full-height forest green column. */
export function IconSidebar() {
  const { makOpen, toggleMak } = useAppShell();

  return (
    <aside className="cx-forest-sidebar relative flex h-full w-14 shrink-0 flex-col">
      <div className="relative flex h-14 shrink-0 items-center justify-center border-b border-white/10">
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          aria-label={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          className={cn(
            "rounded-xl p-1 transition-colors hover:bg-white/10",
            makOpen && "bg-white/15 ring-1 ring-white/25",
          )}
        >
          <CoachMakMark size={32} className={cn(!makOpen && "opacity-95")} />
        </button>

        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          aria-label={makOpen ? "Collapse Coach Mak panel" : "Open Coach Mak panel"}
          className={cn(
            "absolute left-14 top-1/2 z-50 flex h-9 w-6 -translate-y-1/2 items-center justify-center",
            "rounded-r-md border border-l-0 border-white/20 bg-cx-forest-dark text-white/80 shadow-sm",
            "transition-colors hover:bg-white/10 hover:text-white",
            !makOpen && "border-l border-l-white/30 text-white",
          )}
        >
          {makOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
}
