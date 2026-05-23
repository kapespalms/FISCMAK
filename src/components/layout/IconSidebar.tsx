"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";

/** Slim left rail — Coach Mak avatar + panel toggle only. Section nav lives in TopNavBar. */
export function IconSidebar() {
  const { makOpen, toggleMak } = useAppShell();

  return (
    <aside className="relative flex w-[56px] shrink-0 flex-col border-r border-cx-border bg-cx-white">
      <div className="relative flex h-14 shrink-0 items-center justify-center border-b border-cx-border">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            makOpen && "ring-2 ring-cx-accent/50",
          )}
          title="Coach Mak"
        >
          <CoachMakAvatar size={32} className={cn(!makOpen && "opacity-90")} />
        </div>

        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          aria-label={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          className={cn(
            "absolute left-[56px] top-1/2 z-50 flex h-10 w-7 -translate-y-1/2 items-center justify-center",
            "rounded-r-lg border border-l-0 border-cx-border bg-cx-white text-cx-text-secondary shadow-sm",
            "transition-colors hover:bg-cx-cream hover:text-cx-text",
            !makOpen && "border-l-2 border-l-cx-accent text-cx-text",
          )}
        >
          {makOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
