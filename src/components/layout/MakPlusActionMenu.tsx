"use client";

import { useEffect, useRef } from "react";
import {
  Briefcase,
  Paperclip,
  Plus,
  Sparkles,
  Target,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_MECE_OPTIONS } from "@/lib/v2/dashboard-mak-menu";

export type MakActionMenuItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
};

const MECE_ICONS: Record<string, LucideIcon> = {
  profile: UserCircle,
  capture: Sparkles,
  upload: Paperclip,
  goals: Target,
};

type MakPlusActionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MakActionMenuItem[];
  disabled?: boolean;
};

export function buildDefaultMakMenuItems(
  handlers: Record<string, () => void>,
): MakActionMenuItem[] {
  const mece = DASHBOARD_MECE_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.message.split(".")[0] ?? option.message,
    icon: MECE_ICONS[option.id] ?? Sparkles,
    onClick: handlers[option.id] ?? (() => undefined),
  }));

  return [
    ...mece,
    {
      id: "vault",
      label: "Career data vault",
      description: "Open evals, CV, and portfolio evidence",
      icon: Briefcase,
      onClick: handlers.vault ?? (() => undefined),
    },
  ];
}

export function MakPlusActionMenu({
  open,
  onOpenChange,
  items,
  disabled,
}: MakPlusActionMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border border-cx-forest-dark/10 bg-[#e8eaec] text-cx-forest-dark transition-colors",
          "hover:bg-[#dfe2e5] disabled:opacity-50",
          open && "bg-[#dfe2e5] ring-2 ring-cx-forest-dark/10",
        )}
        aria-label={open ? "Close actions menu" : "Open actions menu"}
        aria-expanded={open}
      >
        <Plus size={18} className={cn("transition-transform", open && "rotate-45")} />
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 w-[min(280px,calc(100vw-4rem))] overflow-hidden rounded-xl border border-cx-forest-dark/10 bg-white shadow-lg"
          role="menu"
        >
          <p className="border-b border-cx-forest-dark/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Coach Mak
          </p>
          <ul className="max-h-64 overflow-y-auto py-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[#f3f4f6]"
                    onClick={() => {
                      onOpenChange(false);
                      item.onClick();
                    }}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef0f2] text-cx-forest-dark">
                      <Icon size={16} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-cx-forest-dark">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-cx-forest-dark/65">
                        {item.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
