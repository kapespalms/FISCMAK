import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  accent,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: "green" | "red" | "amber" }) {
  const accentBorder =
    accent === "green"
      ? "border-l-4 border-l-fiscmak-green bg-fiscmak-green-light"
      : accent === "red"
        ? "border-l-4 border-l-fiscmak-red bg-red-50"
        : accent === "amber"
          ? "border-l-4 border-l-fiscmak-amber"
          : "";

  return (
    <div
      className={cn(
        "rounded-lg border border-fiscmak-border bg-white p-6 shadow-sm",
        accentBorder,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
