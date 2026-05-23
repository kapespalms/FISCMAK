import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  ghost?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  ghost,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-dashed border-fiscmak-border bg-fm-surface p-8",
        className,
      )}
    >
      {ghost && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]"
          aria-hidden
        >
          {ghost}
        </div>
      )}
      <div className="relative max-w-lg">
        <h2 className="text-section-header">{title}</h2>
        <p className="mt-2 text-sm text-fiscmak-muted">{description}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="mt-4 inline-block">
            <Button>{actionLabel}</Button>
          </Link>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
