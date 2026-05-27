import Link from "next/link";
import {
  LANDING_LOGO_CM_SRC,
  LANDING_PANEL_FISC_SRC,
  LANDING_PANEL_MAK_SRC,
  LANDING_PANEL_SILENT_C_SRC,
} from "@/lib/brand-assets";

type NameColumn = {
  heading: string;
  subheading: string;
  title: string;
  traits: string[];
  tagline: string;
  taglineEmphasis: string;
  artSrc: string;
  artAlt: string;
};

const NAME_COLUMNS: NameColumn[] = [
  {
    heading: "FISC",
    subheading: "Fiscus",
    title: "The Hidden Treasury",
    traits: ["Expertise.", "Dedication.", "Time."],
    tagline: "A physician's most",
    taglineEmphasis: "valuable treasure",
    artSrc: LANDING_PANEL_FISC_SRC,
    artAlt: "Chessboard perspective representing hidden professional treasure",
  },
  {
    heading: "SILENT 'C'",
    subheading: "Unspoken",
    title: "The Invisible Work",
    traits: ["Essential.", "Dynamic.", "Triumphant."],
    tagline: "A physician's whole career,",
    taglineEmphasis: "fully seen",
    artSrc: LANDING_PANEL_SILENT_C_SRC,
    artAlt: "Chess queen representing invisible work made visible",
  },
  {
    heading: "MAK",
    subheading: "Maximus",
    title: "The Professional Agency",
    traits: ["Empowered.", "Deliberate.", "Transformative."],
    tagline: "A physician's",
    taglineEmphasis: "maximum potential",
    artSrc: LANDING_PANEL_MAK_SRC,
    artAlt: "Chess board representing professional agency and strategy",
  },
];

function GoldFramedArt({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto mt-8 w-full max-w-[220px] md:max-w-none">
      <div className="rounded-sm border-[3px] border-[#c9a227] bg-[#ebe4d4] p-2 shadow-[inset_0_0_0_1px_#7a5c12,0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-transparent">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

function NameColumnCard({ column }: { column: NameColumn }) {
  return (
    <article className="flex flex-col">
      <h3 className="font-futura-bold text-4xl text-marketing-accent md:text-5xl">
        {column.heading}
      </h3>
      <p className="font-futura-medium mt-1 text-lg italic text-black/80 md:text-xl">
        {column.subheading}
      </p>
      <p className="font-futura-bold mt-2 text-xl text-black md:text-2xl">{column.title}</p>
      <ul className="mt-4 space-y-1">
        {column.traits.map((trait) => (
          <li key={trait} className="font-futura-bold text-lg text-marketing-accent md:text-xl">
            {trait}
          </li>
        ))}
      </ul>
      <p className="font-futura-medium mt-5 text-base text-black md:text-lg">
        {column.tagline}{" "}
        <span className="font-futura-bold">{column.taglineEmphasis}</span>
      </p>
      <GoldFramedArt src={column.artSrc} alt={column.artAlt} />
    </article>
  );
}

type FiscmakNameIntroProps = {
  id?: string;
};

export function FiscmakNameIntro({ id }: FiscmakNameIntroProps) {
  return (
    <section id={id} className="bg-black px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LANDING_LOGO_CM_SRC}
          alt="FISCMAK"
          className="h-16 w-auto md:h-20"
          decoding="async"
        />

        <p className="font-futura-bold mt-8 text-xl md:text-2xl">
          <span className="text-marketing-accent">PRONOUNCED: </span>
          <span className="text-marketing-accent">[ </span>
          <span className="text-white">FIZ-MAK</span>
          <span className="text-marketing-accent"> ]</span>
        </p>

        <p className="font-futura-medium mt-5 max-w-3xl text-base text-white md:text-lg">
          By the standard rules of grammar, you should pronounce the C in FISC.
        </p>
        <p className="font-futura-bold mt-2 text-base text-marketing-accent md:text-lg">
          We don&apos;t follow the rules here.
        </p>
      </div>
    </section>
  );
}

export function FiscmakNameBreakdown() {
  return (
    <section className="bg-white px-6 py-14 md:px-10 md:py-20" aria-label="What FISCMAK means">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-10">
        {NAME_COLUMNS.map((column) => (
          <NameColumnCard key={column.heading} column={column} />
        ))}
      </div>
    </section>
  );
}

export function FoundersNarrativeSection() {
  return (
    <section id="our-narrative" className="bg-black px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-8 text-4xl text-white md:text-5xl">
          Founders&apos; Narrative
        </h2>
        <div className="space-y-6 leading-relaxed text-gray-400">
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
          <p>Longitudinal understanding. Pattern recognition. Opportunity mobility.</p>
          <p className="italic">
            FISCMAK is our attempt to make invisible work visible, to honor the treasures physicians
            carry, and to build the career clarity they deserve.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/app/onboarding"
            className="font-futura-bold cx-btn inline-block bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </section>
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
