import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarDecoyIconProps = {
  icon: LucideIcon;
  variant?: "brand" | "mak" | "neutral";
  className?: string;
};

/** Placeholder sidebar glyph until final brand PNGs are wired in. */
export function SidebarDecoyIcon({
  icon: Icon,
  variant = "neutral",
  className,
}: SidebarDecoyIconProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl",
        variant === "brand" && "bg-[#5FD65F]/20 text-[#5FD65F]",
        variant === "mak" && "bg-[#5FD65F]/20 text-[#5FD65F]",
        variant === "neutral" && "bg-white/10 text-white/70",
        className,
      )}
      aria-hidden
    >
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}
