import { cn } from "@/lib/utils";
import { institutionAccentClass } from "@/lib/v2/programs/institution-brand";
import { joinInstitutionLabel } from "@/lib/v2/programs/program-join-display";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";
import {
  MarketingHeroHeadline,
  MarketingHeroHeadlineSpacer,
  marketingHeroHeadlineClass,
} from "@/components/marketing/MarketingHeroHeadline";

const heroSubheroClass =
  "font-futura-medium text-lg leading-snug tracking-[0.04em] md:text-xl lg:text-2xl";

function HeroTagline({
  verb,
  middle,
  end,
}: {
  verb: string;
  middle: string;
  end: string;
}) {
  return (
    <p className={`${heroSubheroClass} whitespace-nowrap`}>
      <span className="text-marketing-accent">{verb}</span>{" "}
      <span className="text-white">{middle}</span>{" "}
      <span className="text-marketing-gold">{end}</span>
    </p>
  );
}

export type MarketingHeroSectionProps = {
  /**
   * Hospital / institution line above the headline (program join pages).
   * Prefer `program` on join routes so labeling stays consistent.
   */
  institutionName?: string | null;
  /** Resolves institution label via joinInstitutionLabel when institutionName is omitted. */
  program?: Pick<ResidencyProgram, "institution_name"> | null;
};

/**
 * Shared hero for all marketing landing pages (`/` and `/join/*`).
 * Optional institution line for hospital/program join routes.
 */
export function MarketingHeroSection({
  institutionName,
  program,
}: MarketingHeroSectionProps = {}) {
  const institutionLabel =
    institutionName?.trim() ||
    (program ? joinInstitutionLabel(program) : null);

  return (
    <section
      id="hero-value-proposition"
      aria-label="Hero value proposition"
      className="relative flex min-h-[min(720px,85svh)] items-start justify-start px-8 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36 lg:px-16 lg:pt-40"
    >
      <div className="relative w-full max-w-6xl">
        {institutionLabel ? (
          <p
            className={cn(
              "font-futura-bold mb-5 text-2xl tracking-wide md:mb-6 md:text-3xl lg:text-4xl",
              institutionAccentClass(institutionLabel),
            )}
          >
            {institutionLabel}
          </p>
        ) : null}

        <MarketingHeroHeadline />

        <div className={cn("mt-4 inline-flex w-fit items-start gap-x-[0.35em] text-white", marketingHeroHeadlineClass)}>
          <MarketingHeroHeadlineSpacer />
          <div className="pl-[1.05ch] normal-case">
            <p className={`max-w-xl whitespace-nowrap text-white ${heroSubheroClass}`}>
              An intelligent career platform for physicians.
            </p>

            <div className="mt-5 flex flex-col gap-2 md:mt-6 md:gap-2.5">
              <HeroTagline verb="Capture" middle="the" end="invisible." />
              <HeroTagline verb="Clarify" middle="your" end="direction." />
              <HeroTagline verb="Build" middle="the career" end="you want." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
