"use client";

import { MessageCircle } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import { openDashboardMakMenu } from "@/lib/v2/dashboard-mak-menu";
import { cn } from "@/lib/utils";

export function DashboardMakButton({ className }: { className?: string }) {
  const { startMakFlow } = useAppShell();

  return (
    <button
      type="button"
      onClick={() => openDashboardMakMenu(startMakFlow)}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 bg-[#AC8636] px-4 py-2.5 text-sm font-semibold text-cx-forest-dark transition-colors hover:bg-[#AC8636]/90",
        className,
      )}
    >
      <MessageCircle size={16} aria-hidden />
      Talk with Mak
    </button>
  );
}
