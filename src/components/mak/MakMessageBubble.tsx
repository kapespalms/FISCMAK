import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MakMessageBubbleProps = {
  children: ReactNode;
  className?: string;
  variant?: "app" | "marketing" | "dark";
};

export function MakAssistantBubble({
  children,
  className,
  variant = "app",
}: MakMessageBubbleProps) {
  return (
    <div
      className={cn(
        "whitespace-pre-line rounded-[20px] px-4 py-2.5 text-[14px] leading-[1.65]",
        variant === "marketing"
          ? "border border-white/15 bg-white/[0.06] text-white/90"
          : variant === "dark"
            ? "border border-white/10 bg-[#141722] text-gray-200"
            : "border border-cx-forest-dark/10 bg-[#f4f5f4] text-cx-text/90",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MakUserBubble({
  children,
  className,
  variant = "app",
}: MakMessageBubbleProps) {
  return (
    <div
      className={cn(
        "whitespace-pre-line rounded-[20px] px-4 py-2.5 text-[14px] leading-[1.55]",
        variant === "marketing"
          ? "bg-marketing-accent/15 text-marketing-cream"
          : variant === "dark"
            ? "border border-[#A3E635]/40 bg-[#1C2030] text-white"
            : "bg-[#67E151]/18 text-cx-text",
        className,
      )}
    >
      {children}
    </div>
  );
}
