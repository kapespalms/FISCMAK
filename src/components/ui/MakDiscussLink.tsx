"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import type { MakDiscussConfig } from "@/lib/card-mak-prompts";

type MakDiscussLinkProps = {
  mak: MakDiscussConfig;
  className?: string;
  variant?: "link" | "button";
};

export function MakDiscussLink({
  mak,
  className,
  variant = "link",
}: MakDiscussLinkProps) {
  const { startMakFlow, openMakWithMessage } = useAppShell();

  function handleClick() {
    if (mak.messageOnly) {
      openMakWithMessage(mak.autoMessage ?? mak.question, mak.navigateTo);
      return;
    }
    startMakFlow(
      mak.intent,
      mak.navigateTo,
      mak.question,
      mak.touchpoint,
      mak.goalFlow,
      mak.goalModifyId,
      mak.autoMessage,
      mak.outputTemplateType,
    );
  }

  const label = mak.label ?? "Discuss with Mak";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-cx-forest-dark/20 bg-white px-3 py-1.5 text-xs font-medium text-cx-forest-dark transition-colors hover:border-cx-forest-dark/35 hover:bg-cx-forest-dark/5",
          className,
        )}
      >
        <MessageCircle size={14} className="shrink-0 text-cx-forest-dark" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark transition-colors hover:text-cx-forest-dark/80",
        className,
      )}
    >
      <MessageCircle size={14} className="shrink-0" aria-hidden />
      {label}
    </button>
  );
}
