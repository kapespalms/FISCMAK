"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { CoachMakMark } from "@/components/brand/CoachMakMark";

/** Slim left rail — Coach Mak mark + lime expand tab when panel is closed. */
export function IconSidebar() {
  const { makOpen, toggleMak } = useAppShell();

  return (
    <aside className="cx-forest-sidebar relative z-30 flex h-full w-14 shrink-0 flex-col">
      <div className="h-14 shrink-0 border-b border-white/10" aria-hidden />

      <div className="flex flex-1 flex-col items-center pt-3">
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Coach Mak is open" : "Open Coach Mak"}
          aria-label={makOpen ? "Coach Mak is open" : "Open Coach Mak"}
          className={cn(
            "rounded-xl p-1.5 transition-colors hover:bg-white/10",
            makOpen && "bg-white/12 ring-1 ring-white/20",
          )}
        >
          <CoachMakMark size={34} className={cn(!makOpen && "opacity-95")} />
        </button>
      </div>

      {!makOpen && (
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={false}
          title="Open Coach Mak"
          aria-label="Open Coach Mak panel"
          className={cn(
            "absolute left-14 top-[calc(3.5rem+0.75rem)] z-50 flex h-9 w-6 -translate-y-1/2 items-center justify-center",
            "rounded-r-md border border-l-0 border-[#5bc94a]/80 bg-[#67E151] text-cx-forest-dark shadow-sm",
            "transition-colors hover:bg-[#7aed68]",
          )}
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </aside>
  );
}
