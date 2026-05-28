import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MakMessageBubbleProps = {
  children: ReactNode;
  className?: string;
  variant?: "app" | "marketing";
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
          : "border border-cx-forest-dark/10 bg-[#f4f5f4] text-cx-forest-dark/90",
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
          : "bg-[#67E151]/18 text-cx-forest-dark",
        className,
      )}
    >
      {children}
    </div>
  );
}
