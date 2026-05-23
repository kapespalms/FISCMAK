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
            step.status === "done" && "text-fm-strong",
            step.status === "active" && "font-medium text-fm-primary",
            step.status === "pending" && "text-fiscmak-muted",
          )}
        >
          {step.status === "done" ? (
            <Check size={16} className="shrink-0 text-fm-strong" aria-hidden />
          ) : (
            <span
              className={cn(
                "inline-block h-4 w-4 shrink-0 rounded-full border-2",
                step.status === "active" ? "border-fm-accent animate-pulse" : "border-fiscmak-border",
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
