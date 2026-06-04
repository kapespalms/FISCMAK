import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  accent,
  glass,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  accent?: "green" | "red" | "amber" | "gold";
  glass?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        glass
          ? "cx-glass-card border-cx-forest-dark/10"
          : "border-[#ECE8DF] bg-[#FCFBF7] shadow-[0_6px_24px_-12px_rgba(122,117,106,0.18)]",
        accent === "green" && "border-l-4 border-l-[#3C8A60]",
        accent === "red"   && "border-l-4 border-l-[#C28D6C]",
        // amber = "needs attention" — uses gold, not crisis red
        accent === "amber" && "border-l-4 border-l-[#AC8636]",
        // gold = hero/treasury accent: 2px gold top + left rule (corner hairline)
        accent === "gold"  && "border-t-2 border-l-2 border-t-[#AC8636] border-l-[#AC8636]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
