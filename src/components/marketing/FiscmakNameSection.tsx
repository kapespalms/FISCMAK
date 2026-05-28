import Link from "next/link";
import { CoachMakAvatar } from "@/components/brand/CoachMakAvatar";
import { LANDING_NAME_BREAKDOWN_SRC } from "@/lib/brand-assets";
import {
  MarketingGlassPanel,
  MarketingSection,
} from "@/components/marketing/MarketingGlass";

type FiscmakNameIntroProps = {
  id?: string;
};

export function FiscmakNameIntro({ id }: FiscmakNameIntroProps) {
  return (
    <MarketingSection
      id={id}
      kicker="Meaning"
      title={
        <>
          What <span className="text-marketing-accent">FISCMAK</span> means
        </>
      }
      description="Three ideas — mutually exclusive, collectively exhaustive — for how we think about physician careers."
      className="pb-8 md:pb-10"
    >
      <MarketingGlassPanel accent className="flex flex-col gap-8 p-8 md:flex-row md:items-start md:gap-10 md:p-10">
        <div className="flex shrink-0 flex-col items-center gap-3 md:items-start">
          <CoachMakAvatar size={64} framed className="marketing-glass-accent" />
          <div className="text-center md:text-left">
            <p className="font-futura-bold text-sm text-marketing-accent">Coach Mak</p>
            <p className="font-futura-medium mt-0.5 max-w-[12rem] text-xs leading-snug text-white/55">
              Your AI career coach — the M inside the silent C.
            </p>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-futura-bold text-xl text-white md:text-2xl">
            Pronounced <span className="text-marketing-accent">[ FIZ-MAK ]</span>
          </p>
          <p className="font-futura-medium mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            By the standard rules of grammar, you should pronounce the C in FISC.{" "}
            <span className="text-marketing-accent">We don&apos;t follow the rules here.</span>
          </p>
        </div>
      </MarketingGlassPanel>
    </MarketingSection>
  );
}

/** Full Canva name board — FISC · Silent C · MAK with framed art (export at 2× from Canva). */
export function FiscmakNameBreakdown() {
  return (
    <section className="px-6 pb-16 md:px-10 md:pb-20" aria-label="FISCMAK name pillars">
      <div className="mx-auto max-w-6xl">
        <MarketingGlassPanel className="marketing-glass-light overflow-hidden rounded-2xl p-2 sm:p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDING_NAME_BREAKDOWN_SRC}
            alt="FISC is the hidden treasury of expertise, dedication, and time; the silent C is unspoken invisible work made fully seen; MAK is Maximus professional agency for maximum potential."
            className="h-auto w-full rounded-xl"
            decoding="async"
            width={1024}
            height={542}
          />
        </MarketingGlassPanel>
      </div>
    </section>
  );
}

export function FoundersNarrativeSection() {
  return (
    <MarketingSection
      id="our-narrative"
      kicker="Story"
      title="Founders' narrative"
      className="bg-transparent"
    >
      <MarketingGlassPanel className="space-y-6 p-8 leading-relaxed text-white/70 md:p-10">
        <p>
          We built FISCMAK because we saw the same pattern over and over: brilliant physicians doing
          invisible work.
        </p>
        <p>
          The teaching happens but isn&apos;t documented. The mentorship exists but isn&apos;t
          recognized. The emotional labor sustains entire programs but never appears in career
          advancement decisions.
        </p>
        <p>
          We started with a simple question:{" "}
          <span className="font-futura-medium text-marketing-accent">
            What if every activity a physician logs becomes insight about their career trajectory?
          </span>
        </p>
        <p>
          Not coaching. Not job boards. Not wellness tools.{" "}
          <span className="font-futura-medium text-marketing-accent">Career intelligence.</span>
        </p>
        <p className="italic text-white/55">
          FISCMAK is our attempt to make invisible work visible, to honor the treasures physicians
          carry, and to build the career clarity they deserve.
        </p>
      </MarketingGlassPanel>

      <div className="mt-10 text-center">
        <Link
          href="/app/onboarding"
          className="font-futura-bold cx-btn inline-block bg-marketing-accent px-8 py-4 text-black shadow-[0_0_28px_rgba(169,255,92,0.3)] transition hover:bg-white hover:shadow-none"
        >
          Start Building
        </Link>
      </div>
    </MarketingSection>
  );
}

export function FiscmakNameSection() {
  return (
    <>
      <FiscmakNameIntro id="about-fiscmak" />
      <FiscmakNameBreakdown />
    </>
  );
}

export function AboutFiscmakContent() {
  return (
    <>
      <FiscmakNameIntro />
      <FiscmakNameBreakdown />
    </>
  );
}
