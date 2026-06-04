"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
};

export function LoadingSteps({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ul className={cn("space-y-2", className)} aria-live="polite">
      {steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            "flex items-center gap-2 text-sm",
            step.status === "done" && "text-cx-success",
            step.status === "active" && "font-medium text-cx-forest-dark",
            step.status === "pending" && "text-cx-forest-dark/50",
          )}
        >
          {step.status === "done" ? (
            <Check size={16} className="shrink-0 text-cx-success" aria-hidden />
          ) : (
            <span
              className={cn(
                "inline-block h-4 w-4 shrink-0 rounded-full border-2",
                step.status === "active" ? "border-[#AC8636] animate-pulse" : "border-cx-forest-dark/20",
              )}
              aria-hidden
            />
          )}
          {step.label}
        </li>
      ))}
    </ul>
  );
}
