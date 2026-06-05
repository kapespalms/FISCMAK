import Link from "next/link";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";

const OWNERSHIP_POINTS = [
  {
    title: "Your data, always yours",
    body: "Every piece of evidence you capture belongs to you. Export or delete at any time — no lock-in.",
  },
  {
    title: "Individual vs. institutional plane",
    body: "Your well-being, career direction, and evidence are never visible to your institution at individual level. Only de-identified aggregate signals cross that boundary, with your consent.",
  },
  {
    title: "Built for physician trust",
    body: "No career-direction data, no Mak transcripts, no personal goals reach any employer or institution. The coaching relationship stays private.",
  },
] as const;

export function LandingDataOwnershipSection() {
  return (
    <section
      id="data-ownership"
      aria-label="Data ownership"
      className="relative px-6 py-16 md:px-10 md:py-20"
    >
      <div className="relative mx-auto max-w-6xl">
        <p className="font-futura-medium text-xs uppercase tracking-[0.22em] text-marketing-accent/90">
          Privacy by design
        </p>
        <h2 className="font-futura-bold mt-3 text-3xl text-cx-text md:text-4xl lg:text-5xl">
          Your career record.
          <br />
          <span className="text-marketing-accent">Not theirs.</span>
        </h2>
        <p className="font-futura-medium mt-4 max-w-2xl text-base leading-relaxed text-cx-text/60 md:text-lg">
          Physicians deserve a career platform that works for them — not one that reports to their
          employer. FISCMAK was designed with that boundary from the first line of code.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {OWNERSHIP_POINTS.map((point) => (
            <MarketingGlassPanel key={point.title} className="p-6">
              <h3 className="font-futura-bold text-base text-cx-text">{point.title}</h3>
              <p className="font-futura-medium mt-2 text-sm leading-relaxed text-cx-text/60">
                {point.body}
              </p>
            </MarketingGlassPanel>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/security"
            className="font-futura-medium text-sm text-marketing-accent underline-offset-4 hover:underline"
          >
            Read our security and privacy approach
          </Link>
        </div>
      </div>
    </section>
  );
}
