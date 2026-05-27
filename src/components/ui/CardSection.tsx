"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import type { MakDiscussConfig } from "@/lib/card-mak-prompts";

export type CardSectionProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  icon?: LucideIcon;
  accent?: "green" | "red" | "amber";
  mak?: MakDiscussConfig;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function CardSectionHeader({
  title,
  eyebrow,
  description,
  icon: Icon,
  action,
  compact,
}: Pick<
  CardSectionProps,
  "title" | "eyebrow" | "description" | "icon" | "action" | "compact"
>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        !compact && "border-b border-cx-forest-dark/15 pb-4",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cx-forest-dark/10 text-cx-forest-dark"
            aria-hidden
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "font-semibold text-cx-forest-dark",
              compact ? "text-base" : "mt-0.5 text-xl",
              eyebrow && !compact && "mt-1",
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-sm text-cx-forest-dark/70",
                compact ? "mt-1" : "mt-1.5",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardSection({
  title,
  eyebrow,
  description,
  icon,
  accent,
  mak,
  action,
  footer,
  compact,
  className,
  children,
}: CardSectionProps) {
  const hasHeader = Boolean(title || eyebrow || description || icon || action);

  return (
    <Card accent={accent} className={className}>
      {hasHeader && (
        <CardSectionHeader
          title={title}
          eyebrow={eyebrow}
          description={description}
          icon={icon}
          action={action}
          compact={compact}
        />
      )}
      {children && (
        <div className={cn(hasHeader && (compact ? "mt-3" : "mt-4"))}>{children}</div>
      )}
      {(mak || footer) && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3",
            hasHeader || children ? "mt-4 border-t border-cx-forest-dark/15 pt-4" : "",
          )}
        >
          {mak && (
            <MakDiscussLink
              mak={mak}
              className="text-cx-forest-dark hover:text-cx-forest-dark/80"
            />
          )}
          {footer}
        </div>
      )}
    </Card>
  );
}
