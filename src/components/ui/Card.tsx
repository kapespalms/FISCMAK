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
        "rounded-2xl border border-cx-forest-dark/10 bg-cx-white p-6 shadow-sm",
        accent === "green" && "border-l-4 border-l-[#5FD65F]",
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
