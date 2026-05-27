import { cn } from "@/lib/utils";
import {
  LANDING_HERO_QUEEN_SRC,
  LANDING_LOGO_CM_SRC,
  LANDING_PANEL_FISC_SRC,
  LANDING_PANEL_MAK_SRC,
  LANDING_PANEL_SILENT_C_SRC,
} from "@/lib/brand-assets";
import {
  MarketingHeroHeadline,
  MarketingHeroHeadlineSpacer,
  marketingHeroHeadlineClass,
} from "@/components/marketing/MarketingHeroHeadline";
import { institutionAccentClass } from "@/lib/v2/programs/institution-brand";
import { joinInstitutionLabel } from "@/lib/v2/programs/program-join-display";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

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
  institutionName?: string | null;
  program?: Pick<ResidencyProgram, "institution_name"> | null;
};

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
      className="px-8 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36 lg:px-16 lg:pt-40"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_min(36vw,400px)] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_min(38vw,440px)]">
        <div className="min-w-0">
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

          <div
            className={cn(
              "mt-4 inline-flex w-fit items-start gap-x-[0.35em] text-white",
              marketingHeroHeadlineClass,
            )}
          >
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

        <div className="flex items-center justify-center lg:items-end lg:justify-end lg:self-stretch">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_HERO_QUEEN_SRC}
            alt=""
            aria-hidden
            className="h-auto w-full max-w-[280px] object-contain object-bottom drop-shadow-[0_24px_80px_rgba(103,225,81,0.18)] sm:max-w-[320px] lg:max-h-[min(58vh,540px)] lg:max-w-none lg:w-auto"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
