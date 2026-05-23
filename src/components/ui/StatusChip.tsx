import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type MetricStatus } from "@/lib/design-system";

export function StatusChip({
  status,
  className,
}: {
  status: MetricStatus;
  className?: string;
}) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
