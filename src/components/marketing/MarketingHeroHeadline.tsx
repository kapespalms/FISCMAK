import { cn } from "@/lib/utils";

/** Shared typography for the landing hero headline. */
export const marketingHeroHeadlineClass =
  "font-futura-bold text-[clamp(2.25rem,5.5vw,4.75rem)] uppercase leading-[1.08] tracking-tight";

export function MarketingHeroHeadline({ className }: { className?: string }) {
  return (
    <h1 className={cn("max-w-2xl text-cx-text", marketingHeroHeadlineClass, className)}>
      <span className="block">
        What move <span className="text-marketing-accent">honors</span>
      </span>
      <span className="mt-1 block">your work?</span>
    </h1>
  );
}
