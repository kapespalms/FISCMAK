import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  accent,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: "green" | "red" | "amber" }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-cx-border/70 bg-cx-white p-6 shadow-sm",
        accent === "green" && "border-l-4 border-l-cx-success",
        accent === "red" && "border-l-4 border-l-red-500",
        accent === "amber" && "border-l-4 border-l-cx-attention",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
