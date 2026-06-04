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
    default: "bg-cx-forest-dark/10 text-cx-text",
    energizing: "bg-[#3C8A60]/15 text-cx-success",
    draining: "bg-fm-attention/10 text-fm-attention",
    neutral: "bg-fm-developing/15 text-fm-developing",
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
