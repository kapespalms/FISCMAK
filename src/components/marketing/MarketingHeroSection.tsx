import { cn } from "@/lib/utils";
import { LANDING_HERO_QUEEN_SRC } from "@/lib/brand-assets";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";
import { MarketingHeroHeadline } from "@/components/marketing/MarketingHeroHeadline";
import { institutionAccentClass } from "@/lib/v2/programs/institution-brand";
import { joinInstitutionLabel } from "@/lib/v2/programs/program-join-display";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

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
    <p className="font-futura-medium text-base leading-relaxed text-white/85 md:text-lg">
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
      className="relative px-6 pb-12 pt-28 sm:px-8 md:pb-16 md:pt-32 lg:px-10 lg:pt-36"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:gap-8">
        <MarketingGlassPanel accent className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
          <p className="font-futura-medium text-xs uppercase tracking-[0.22em] text-marketing-accent/90">
            Promise
          </p>

          {institutionLabel ? (
            <p
              className={cn(
                "font-futura-bold mt-4 text-xl tracking-wide md:text-2xl",
                institutionAccentClass(institutionLabel),
              )}
            >
              {institutionLabel}
            </p>
          ) : null}

          <div className={institutionLabel ? "mt-4" : "mt-3"}>
            <MarketingHeroHeadline />
          </div>

          <p className="font-futura-medium mt-5 max-w-lg text-lg leading-relaxed text-white/75">
            An intelligent career platform for physicians.
          </p>

          <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 md:gap-2.5">
            <HeroTagline verb="Capture" middle="the" end="invisible." />
            <HeroTagline verb="Clarify" middle="your" end="direction." />
            <HeroTagline verb="Build" middle="the career" end="you want." />
          </div>
        </MarketingGlassPanel>

        <MarketingGlassPanel className="relative flex items-center justify-center overflow-hidden p-6 md:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(169,255,92,0.14),transparent_65%)]"
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_HERO_QUEEN_SRC}
            alt=""
            aria-hidden
            className="relative z-[1] h-auto w-full max-w-[min(100%,360px)] object-contain drop-shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
            decoding="async"
          />
        </MarketingGlassPanel>
      </div>
    </section>
  );
}
