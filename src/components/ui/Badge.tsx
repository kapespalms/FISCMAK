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
    default: "bg-fiscmak-green-light text-fiscmak-green",
    energizing: "bg-fiscmak-green-light text-fiscmak-green",
    draining: "bg-red-50 text-fiscmak-red",
    neutral: "bg-amber-50 text-fiscmak-amber",
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
