import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  accent,
  glass,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: "green" | "red" | "amber"; glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        glass
          ? "cx-glass-card border-cx-forest-dark/10"
          : "border-cx-forest-dark/10 bg-cx-white shadow-sm",
        accent === "green" && "border-l-4 border-l-[#3C8A60]",
        accent === "red" && "border-l-4 border-l-[#C28D6C]",
        accent === "amber" && "border-l-4 border-l-cx-attention",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
