import Link from "next/link";

type FiscmakNameIntroProps = {
  id?: string;
};

export function FiscmakNameIntro({ id }: FiscmakNameIntroProps) {
  return (
    <section id={id} className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold text-5xl text-white md:text-7xl lg:text-8xl">
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </h2>

        <p className="font-futura-bold mt-6 text-xl md:text-2xl">
          <span className="text-marketing-accent">PRONOUNCED: </span>
          <span className="text-marketing-accent">[ </span>
          <span className="text-white">FIZ-MAK</span>
          <span className="text-marketing-accent"> ]</span>
        </p>

        <p className="font-futura-condensed mt-5 max-w-3xl text-base text-white md:text-lg">
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
    <section className="px-6 pb-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              FISC
              <br />
              <span className="text-marketing-accent">THE HIDDEN TREASURY</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Derived from <em>fiscus</em>, a &quot;fisc&quot; is used to store an empire&apos;s most
              valuable treasures.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              In medicine, expertise, dedication, and time are the ultimate assets.
            </p>
          </div>

          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              THE SILENT &apos;C&apos;
              <br />
              <span className="text-marketing-accent">THE INVISIBLE WORK</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Represents the amount of invisible work doctors perform every day.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              It stands for the hours spent navigating clunky systems, charting, and battling friction
              in silence.
            </p>
          </div>

          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              MAK
              <br />
              <span className="text-marketing-accent">THE HIGHEST STANDARD</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">Rooted in the name Maximus.</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              &quot;MAK&quot; stands for the highest possible standard of excellence and autonomy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FoundersNarrativeSection() {
  return (
    <section id="our-narrative" className="px-6 py-16 md:px-10 md:py-20">
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
            className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
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
