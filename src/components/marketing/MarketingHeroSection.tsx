import Link from "next/link";
import { cn } from "@/lib/utils";
import { LANDING_PANEL_SILENT_C_SRC } from "@/lib/brand-assets";
import { FiscMakLightBox } from "@/components/marketing/FiscMakLightBox";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";
import { MarketingHeroHeadline } from "@/components/marketing/MarketingHeroHeadline";
import { MarketingPanelImage } from "@/components/marketing/MarketingPanelImage";
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
  variant?: "landing" | "join";
};

export function MarketingHeroSection({
  institutionName,
  program,
  variant = "landing",
}: MarketingHeroSectionProps = {}) {
  const isJoin = variant === "join";
  const institutionLabel =
    institutionName?.trim() ||
    (program ? joinInstitutionLabel(program) : null);

  return (
    <section
      id="hero-value-proposition"
      aria-label="Hero value proposition"
      className="relative px-6 pb-12 pt-28 sm:px-8 md:pb-16 md:pt-32 lg:px-10 lg:pt-36"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:gap-8">
        <MarketingGlassPanel
          accent={!isJoin}
          className={cn(
            "flex flex-col justify-center p-8 md:p-10 lg:p-12",
            isJoin && "marketing-glass-light border-cx-forest-dark/10",
          )}
        >
          {institutionLabel ? (
            <p
              className={cn(
                "font-futura-bold text-xl tracking-wide md:text-2xl",
                institutionAccentClass(institutionLabel),
              )}
            >
              {institutionLabel}
            </p>
          ) : null}

          <div className={institutionLabel ? "mt-4" : undefined}>
            <MarketingHeroHeadline
              className={isJoin ? "text-cx-forest-dark" : undefined}
            />
          </div>

          {!isJoin ? (
            <>
              <p className="font-futura-medium mt-5 max-w-lg text-lg leading-relaxed text-white/75">
                FISCMAK helps physicians turn invisible work into career evidence, narrative, and
                direction.
              </p>

              <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 md:gap-2.5">
                <HeroTagline verb="Capture" middle="the" end="invisible." />
                <HeroTagline verb="Clarify" middle="your" end="direction." />
                <HeroTagline verb="Build" middle="the career" end="you want." />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/app/onboarding"
                  className="font-futura-bold cx-btn bg-marketing-accent px-6 py-3 text-sm text-black shadow-[0_0_24px_rgba(169,255,92,0.25)] transition hover:bg-white hover:shadow-none"
                >
                  Start Building
                </Link>
                <Link
                  href="#how-it-works"
                  className="font-futura-bold cx-btn border border-white/20 bg-white/5 px-6 py-3 text-sm text-white backdrop-blur-sm transition hover:border-marketing-accent/40 hover:bg-white/10"
                >
                  See How It Works
                </Link>
              </div>
            </>
          ) : null}
        </MarketingGlassPanel>

        {isJoin ? (
          <div className="relative xl:min-h-[540px]">
            <FiscMakLightBox />
          </div>
        ) : (
          <MarketingGlassPanel className="relative flex items-center justify-center overflow-hidden p-5 sm:p-6 md:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(169,255,92,0.12),transparent_68%)]"
              aria-hidden
            />
            <div className="relative z-[1] w-full max-w-[min(100%,420px)]">
              <MarketingPanelImage
                src={LANDING_PANEL_SILENT_C_SRC}
                alt="FISCMAK — career intelligence for physicians"
                variant="hero"
                className="marketing-glass shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              />
            </div>
          </MarketingGlassPanel>
        )}
      </div>
    </section>
  );
}
