"use client";

import { cn } from "@/lib/utils";
import { DASHBOARD_OPTION_TABS } from "@/lib/mak-sections";
import { NavIcon } from "@/components/brand/NavIcon";

type DashboardOptionTabsProps = {
  onSelect: (id: (typeof DASHBOARD_OPTION_TABS)[number]["id"], href: string) => void;
  activeId?: string | null;
};

function FolderTabShape({
  fill,
  active,
}: {
  fill: string;
  active: boolean;
}) {
  return (
    <svg
      viewBox="0 0 180 50"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-[calc(100%+14px)] max-w-none"
      aria-hidden
    >
      <path
        d="M 16 49 L 16 16 C 16 10 21 6 28 6 L 118 6 C 124 6 129 8 132 6 C 138 4 148 6 154 10 L 164 6 C 170 6 174 10 174 16 L 174 49 Z"
        fill={fill}
        stroke={active ? "#94a3b8" : "#cbd5e1"}
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function DashboardOptionTabs({ onSelect, activeId }: DashboardOptionTabsProps) {
  return (
    <div className="relative border-b border-fiscmak-border pb-0">
      <div
        className="flex items-end overflow-x-auto pl-1"
        role="tablist"
        aria-label="Main dashboard options"
      >
        {DASHBOARD_OPTION_TABS.map((option, index) => {
          const active = activeId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(option.id, option.href)}
              className={cn(
                "relative flex h-[50px] min-w-[128px] flex-1 items-center justify-center",
                index > 0 && "-ml-3",
                active ? "z-30" : "z-10 hover:z-20",
              )}
            >
              <FolderTabShape fill={option.color} active={active} />
              <span
                className={cn(
                  "relative z-10 flex items-center gap-2 px-5 py-2",
                  active && "-translate-y-px",
                )}
              >
                <NavIcon src={option.icon} alt={option.label} size={20} />
                <span className="whitespace-nowrap text-sm font-semibold text-fiscmak-ink">
                  {option.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
