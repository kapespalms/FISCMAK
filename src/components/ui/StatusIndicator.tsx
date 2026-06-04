"use client";

import { AlertTriangle, ArrowRight, Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusKind = "done" | "active" | "attention" | "locked" | "upcoming";

const CONFIG: Record<
  StatusKind,
  { Icon: typeof Check; className: string; label: string }
> = {
  done: { Icon: Check, className: "text-cx-success", label: "Done" },
  active: { Icon: ArrowRight, className: "text-cx-text", label: "Active" },
  attention: { Icon: AlertTriangle, className: "text-cx-attention", label: "Attention" },
  locked: { Icon: Circle, className: "text-cx-text/50", label: "Locked" },
  upcoming: { Icon: CircleDot, className: "text-cx-text", label: "Upcoming" },
};

type StatusIndicatorProps = {
  status: StatusKind;
  size?: number;
  showLabel?: boolean;
  className?: string;
};

export function StatusIndicator({
  status,
  size = 16,
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const { Icon, className: colorClass, label } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon size={size} className={colorClass} aria-hidden />
      {showLabel && <span className="text-cx-label">{label}</span>}
      <span className="sr-only">{label}</span>
    </span>
  );
}
