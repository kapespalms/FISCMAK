import { cn } from "@/lib/utils";

/** Shared typography for headline + alignment spacers. */
export const marketingHeroHeadlineClass =
  "font-futura-bold text-4xl uppercase leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]";

/**
 * Canonical FISCMAK landing headline layout.
 *
 * WHAT MOVE HONORS
 *      YOUR WORK?
 *
 * Keep "move" and "honors" inline (nested flex). Do not use a 3-column grid here —
 * placing the subhero in the same grid stretches column 2 and pushes "honors" to the far right.
 */
export function MarketingHeroHeadline({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex w-fit items-start gap-x-[0.35em] text-white", marketingHeroHeadlineClass, className)}>
      <h1 className="inline-flex items-start gap-x-[0.35em]">
        <span className="whitespace-nowrap">What</span>

        <span className="inline-flex w-fit flex-col items-start">
          <span className="inline-flex w-fit items-baseline gap-x-[0.35em] whitespace-nowrap">
            <span>move</span>
            <span className="text-marketing-accent">honors</span>
          </span>
          <span className="whitespace-nowrap">your work?</span>
        </span>
      </h1>
    </div>
  );
}

/** Invisible "What" spacer so subhero/taglines align under the move column. */
export function MarketingHeroHeadlineSpacer({ className }: { className?: string }) {
  return (
    <span
      className={cn("invisible w-fit whitespace-nowrap select-none", marketingHeroHeadlineClass, className)}
      aria-hidden
    >
      What
    </span>
  );
}
