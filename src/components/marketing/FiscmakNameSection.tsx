import Link from "next/link";
import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";

export function FiscmakNameSection() {
  return (
    <MarketingFontShell>
      <section id="our-narrative" className="px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <h2 className="font-futura-bold text-5xl text-white">FISCMAK</h2>
            <p className="font-futura-bold mt-4 text-2xl text-marketing-accent">
              Pronounced: [FIZ-MAK]
            </p>
            <p className="mt-3 text-lg text-gray-400">
              By the standard rules of grammar, you should pronounce the C in FISC.
              <span className="font-futura-bold text-marketing-accent">
                {" "}
                We don&apos;t follow the rules here.
              </span>
            </p>
          </div>

          <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
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
                It stands for the hours spent navigating clunky systems, charting, and battling
                friction in silence.
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

          <div className="my-16 border-t border-gray-800" />

          <div className="mb-12">
            <h2 className="font-futura-bold mb-8 text-4xl text-white">Founders&apos; Narrative</h2>
            <div className="space-y-6 leading-relaxed text-gray-400">
              <p>
                We built FISCMAK because we saw the same pattern over and over: brilliant physicians
                doing invisible work.
              </p>
              <p>
                The teaching happens but isn&apos;t documented. The mentorship exists but isn&apos;t
                recognized. The emotional labor sustains entire programs but never appears in career
                advancement decisions.
              </p>
              <p>
                We started with a simple question:{" "}
                <span className="font-futura-medium text-marketing-accent">
                  What if every activity a physician logs becomes insight about their career
                  trajectory?
                </span>
              </p>
              <p>
                Not coaching. Not job boards. Not wellness tools.{" "}
                <span className="font-futura-medium text-marketing-accent">Career intelligence.</span>
              </p>
              <p>Longitudinal understanding. Pattern recognition. Opportunity mobility.</p>
              <p className="italic">
                FISCMAK is our attempt to make invisible work visible, to honor the treasures
                physicians carry, and to build the career clarity they deserve.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/signup"
              className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
            >
              Start Building
            </Link>
          </div>
        </div>
      </section>
    </MarketingFontShell>
  );
}
