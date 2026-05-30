import Link from "next/link";
import {
  LANDING_PANEL_FISC_SRC,
  LANDING_PANEL_MAK_SRC,
  LANDING_PANEL_SILENT_C_SRC,
} from "@/lib/brand-assets";
import {
  MarketingGlassPanel,
  MarketingSection,
} from "@/components/marketing/MarketingGlass";
import { MarketingPanelImage } from "@/components/marketing/MarketingPanelImage";

const NAME_PILLARS = [
  {
    key: "fisc",
    title: "FISC",
    subtitle: "Fiscus",
    heading: "The hidden treasury",
    traits: ["Expertise", "Dedication", "Time"],
    footer: "A physician's most valuable treasure.",
    image: LANDING_PANEL_FISC_SRC,
    imageAlt: "Chessboard — expertise and dedication as hidden value",
  },
  {
    key: "silent-c",
    title: "Silent C",
    subtitle: "Unspoken",
    heading: "The invisible work",
    traits: ["Essential", "Dynamic", "Triumphant"],
    footer: "A physician's whole career, fully seen.",
    image: LANDING_PANEL_SILENT_C_SRC,
    imageAlt: "Chess king — invisible work made visible",
  },
  {
    key: "mak",
    title: "MAK",
    subtitle: "Maximus",
    heading: "Professional agency",
    traits: ["Empowered", "Deliberate", "Transformative"],
    footer: "Reach your maximum potential.",
    image: LANDING_PANEL_MAK_SRC,
    imageAlt: "Chess board — career at full potential",
  },
] as const;

function NamePillarCard({
  title,
  subtitle,
  heading,
  traits,
  footer,
  image,
  imageAlt,
}: Omit<(typeof NAME_PILLARS)[number], "key">) {
  return (
    <MarketingGlassPanel
      as="article"
      accent
      className="marketing-glass-hover flex h-full flex-col p-6 md:p-7"
    >
      <p className="font-futura-bold text-2xl tracking-tight text-marketing-accent md:text-3xl">
        {title}
      </p>
      <p className="font-futura-medium mt-1 text-sm italic text-white/50">{subtitle}</p>
      <h3 className="font-futura-bold mt-4 text-lg text-white md:text-xl">{heading}</h3>

      <ul className="mt-4 space-y-1">
        {traits.map((trait) => (
          <li key={trait} className="font-futura-medium text-sm text-marketing-accent/95">
            {trait}.
          </li>
        ))}
      </ul>

      <p className="font-futura-medium mt-5 text-sm leading-relaxed text-white/70">{footer}</p>

      <div className="marketing-glass mt-6 overflow-hidden rounded-xl bg-[#030303] p-1">
        <MarketingPanelImage src={image} alt={imageAlt} variant="tile" />
      </div>
    </MarketingGlassPanel>
  );
}

export function FoundersNarrativeSection() {
  return (
    <>
      <MarketingSection
        title={
          <>
            What <span className="text-marketing-accent">FISCMAK</span> means
          </>
        }
        description="Three ideas — mutually exclusive, collectively exhaustive — for how we think about physician careers."
      >
        <MarketingGlassPanel accent className="p-8 md:p-10">
          <p className="font-futura-bold text-xl text-white md:text-2xl">
            Pronounced <span className="text-marketing-accent">[ FIZ-MAK ]</span>
          </p>
          <p className="font-futura-medium mt-3 max-w-2xl text-base leading-relaxed text-white/70">
            By the standard rules of grammar, you should pronounce the C in FISC.
          </p>
          <p className="font-futura-medium mt-2 text-base leading-relaxed text-marketing-accent">
            We don&apos;t follow the rules here.
          </p>
        </MarketingGlassPanel>
      </MarketingSection>

      <section className="px-6 pb-8 md:px-10" aria-label="FISCMAK name pillars">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {NAME_PILLARS.map(({ key, ...pillar }) => (
              <NamePillarCard key={key} {...pillar} />
            ))}
          </div>
        </div>
      </section>

      <MarketingSection title="Founders' narrative">
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
    </>
  );
}