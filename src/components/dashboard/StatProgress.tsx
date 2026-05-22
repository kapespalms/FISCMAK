import { cn } from "@/lib/utils";

type StatProgressProps = {
  label: string;
  value: string;
  detail?: string;
  percent: number;
  barClassName: string;
  className?: string;
};

export function StatProgress({
  label,
  value,
  detail,
  percent,
  barClassName,
  className,
}: StatProgressProps) {
  return (
    <div className={cn("rounded-lg border border-fiscmak-border p-3", className)}>
      <p className="text-xs font-semibold uppercase text-fiscmak-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      {detail && <p className="mt-0.5 text-xs text-fiscmak-muted">{detail}</p>}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-fiscmak-subtle">
        <div
          className={cn("h-full rounded-full transition-all", barClassName)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
