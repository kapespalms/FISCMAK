"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { MAK_DISPLAY_NAME } from "@/lib/brand-assets";

/** Slim left rail — Mak avatar + gold expand tab when panel is closed. */
export function IconSidebar() {
  const { makOpen, toggleMak } = useAppShell();

  return (
    <aside className="relative z-30 flex h-full w-14 shrink-0 flex-col border-r border-white/10 bg-[#0A0C10]">
      <div className="h-14 shrink-0 border-b border-white/10" aria-hidden />

      <div className="flex flex-1 flex-col items-center pt-3">
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? `${MAK_DISPLAY_NAME} is open` : `Open ${MAK_DISPLAY_NAME}`}
          aria-label={makOpen ? `${MAK_DISPLAY_NAME} is open` : `Open ${MAK_DISPLAY_NAME}`}
          className={cn(
            "rounded-xl p-1.5 transition-colors hover:bg-white/10",
            makOpen && "bg-[#141722] ring-1 ring-[#A3E635]/30",
          )}
        >
          <CoachMakAvatar size={34} className={cn(!makOpen && "opacity-95")} />
        </button>
      </div>

      {!makOpen && (
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={false}
          title={`Open ${MAK_DISPLAY_NAME}`}
          aria-label={`Open ${MAK_DISPLAY_NAME} panel`}
          className={cn(
            "absolute left-14 top-[calc(3.5rem+0.75rem)] z-50 flex h-9 w-6 -translate-y-1/2 items-center justify-center",
            "rounded-r-md border border-l-0 border-[#A3E635]/80 bg-[#A3E635] text-[#0A0C10] shadow-sm",
            "transition-colors hover:bg-[#b8f04a]",
          )}
        >
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </aside>
  );
}
