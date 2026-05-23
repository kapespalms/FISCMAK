import { cn } from "@/lib/utils";

type Energy = "energizing" | "draining" | "neutral" | "default";

export function Badge({
  children,
  energy = "default",
  className,
}: {
  children: React.ReactNode;
  energy?: Energy;
  className?: string;
}) {
  const styles: Record<Energy, string> = {
    default: "bg-cx-accent-soft text-cx-text",
    energizing: "bg-cx-accent-soft text-cx-text",
    draining: "bg-red-50 text-red-700",
    neutral: "bg-amber-50 text-cx-attention",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        styles[energy],
        className,
      )}
    >
      {children}
    </span>
  );
}
