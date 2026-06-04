"use client";

import { Sparkles } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";

type MakHelpChipProps = {
  label?: string;
  message: string;
};

export function MakHelpChip({ label = "Ask Mak", message }: MakHelpChipProps) {
  const { openMakWithMessage } = useAppShell();

  return (
    <button
      type="button"
      onClick={() => openMakWithMessage(message)}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#3C8A60]/40 bg-[#3C8A60]/10 px-3 py-1.5 text-xs font-medium text-cx-forest-dark transition hover:bg-[#3C8A60]/20"
    >
      <Sparkles className="h-3.5 w-3.5 text-cx-forest-dark/70" aria-hidden />
      {label}
    </button>
  );
}
