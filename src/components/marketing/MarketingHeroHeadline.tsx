import { cn } from "@/lib/utils";

/** Shared typography for the landing hero headline. */
export const marketingHeroHeadlineClass =
  "font-futura-bold text-[clamp(2.25rem,5.5vw,4.75rem)] uppercase leading-[1.08] tracking-tight";

/**
 * Canonical FISCMAK landing headline — stacked lines so copy never collides with hero art.
 */
export function MarketingHeroHeadline({ className }: { className?: string }) {
  return (
    <h1 className={cn("max-w-2xl text-white", marketingHeroHeadlineClass, className)}>
      <span className="block">What move</span>
      <span className="block">
        <span className="text-marketing-accent">honors</span> your work?
      </span>
    </h1>
  );
}
