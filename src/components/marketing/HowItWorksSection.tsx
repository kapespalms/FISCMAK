import Link from "next/link";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";

const FLOW_STEPS = [
  {
    n: "01",
    title: "Capture what counts",
    body: "Talk to Mak after a hard case, a teaching moment, or a leadership win. Voice, chat, or structured entry — your invisible work becomes a living record.",
  },
  {
    n: "02",
    title: "Map your arc",
    body: "Mak connects activities across time: competency signals, career goals, gaps worth closing, and the through-line that ties your work together.",
  },
  {
    n: "03",
    title: "Build from evidence",
    body: "Generate CV updates, career narratives, cover letters, and promotion materials from real work — not blank-page guesswork or last-minute scrambling.",
  },
  {
    n: "04",
    title: "Claim Your Career",
    body: "Own the direction you've been building — portfolio, narrative, and next move aligned when opportunity arrives.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section aria-label="How FISCMAK works" className="relative px-6 py-16 md:px-10 md:py-20">
      <div className="relative mx-auto max-w-6xl">
        <h1 className="font-futura-bold text-3xl text-cx-forest-dark md:text-4xl lg:text-5xl">
          How <span className="text-marketing-accent">FISCMAK</span> works
        </h1>
        <p className="font-futura-bold mt-4 max-w-2xl text-base leading-relaxed text-cx-forest-dark/80 md:text-lg">
          From invisible work to career evidence — a loop designed for physicians who are too busy to
          maintain a portfolio by hand.
        </p>

        <MarketingGlassPanel accent className="relative mt-10 overflow-hidden p-8 md:p-12">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_0%_50%,rgba(169,255,92,0.06),transparent_60%)]"
            aria-hidden
          />

          <ol className="relative space-y-0">
            {FLOW_STEPS.map((step, index) => (
              <li
                key={step.n}
                className="fiscmak-flow-detail group grid grid-cols-1 gap-4 border-b border-white/[0.06] py-8 last:border-b-0 md:grid-cols-[5rem_1fr] md:gap-8 md:py-10"
              >
                <div className="flex items-start md:justify-center">
                  <span className="font-futura-bold text-2xl text-marketing-accent/80 transition-colors duration-300 group-hover:text-marketing-accent md:text-3xl">
                    {step.n}
                  </span>
                </div>
                <div>
                  <h2 className="font-futura-bold text-xl text-white md:text-2xl">{step.title}</h2>
                  <p className="font-futura-bold mt-3 max-w-2xl text-sm leading-relaxed text-white md:text-base">
                    {step.body}
                  </p>
                </div>
                {index < FLOW_STEPS.length - 1 ? (
                  <div
                    className="col-span-full hidden h-px bg-gradient-to-r from-marketing-accent/30 via-white/5 to-transparent md:block"
                    aria-hidden
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </MarketingGlassPanel>

        <MarketingGlassPanel className="mt-8 p-6 md:p-8">
          <p className="font-futura-bold text-sm leading-relaxed text-white md:text-base">
            Residency and GME programs use FISCMAK for cohort dashboards, evaluation import, and
            review prep —{" "}
            <Link href="/institutions" className="text-marketing-accent transition hover:text-white">
              see Institutions
            </Link>
            .
          </p>
        </MarketingGlassPanel>
      </div>
    </section>
  );
}
