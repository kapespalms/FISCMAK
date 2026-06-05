import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";

const TRUST_SIGNALS = [
  {
    quote:
      "I had no idea how much invisible work I was doing until it showed up in the lattice. It changed how I talked about my own career.",
    attribution: "Academic hospitalist, PGY+7",
  },
  {
    quote:
      "Mak asked me one question I'd never asked myself. That conversation became my promotion narrative.",
    attribution: "Associate professor, academic medicine",
  },
  {
    quote:
      "The pre-CCC synthesis saved our coordinator two hours per resident. It reads like we wrote it — because the data was already there.",
    attribution: "Program director, psychiatry residency",
  },
] as const;

export function LandingProofSection() {
  return (
    <section
      id="proof"
      aria-label="What physicians say"
      className="relative px-6 py-16 md:px-10 md:py-20"
    >
      <div className="relative mx-auto max-w-6xl">
        <p className="font-futura-medium text-xs uppercase tracking-[0.22em] text-marketing-accent/90">
          From the field
        </p>
        <h2 className="font-futura-bold mt-3 text-3xl text-cx-text md:text-4xl">
          Physicians who use it
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TRUST_SIGNALS.map((signal) => (
            <MarketingGlassPanel
              key={signal.attribution}
              className="flex flex-col justify-between gap-4 p-6 md:p-8"
            >
              <blockquote className="font-futura-medium text-base leading-relaxed text-cx-text/75">
                &ldquo;{signal.quote}&rdquo;
              </blockquote>
              <p className="text-xs text-cx-text/40">{signal.attribution}</p>
            </MarketingGlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
}
