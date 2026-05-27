import { MarketingGlassPanel, MarketingSection } from "@/components/marketing/MarketingGlass";

/** MECE product loop — matches what FISCMAK actually ships today. */
const STEPS = [
  {
    n: 1,
    title: "Connect your work",
    body: "Log activities with Coach Mak. Programs import MedHub evals; trainees add milestone self-ratings and rotation context.",
  },
  {
    n: 2,
    title: "Coach Mak remembers",
    body: "One longitudinal coach — debriefs, goals, and wellbeing check-ins. Private signals for you; never surveillance scores on your dashboard.",
  },
  {
    n: 3,
    title: "Synthesize evidence",
    body: "Pre-CCC summaries, milestone heatmaps, lattice mapping, and document drafts built from your real work — not invented metrics.",
  },
  {
    n: 4,
    title: "Show up prepared",
    body: "ILP goals from gaps, CCC-ready PDFs for program staff, and quarterly pulse so semiannual reviews take minutes, not hours.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <MarketingSection
      id="how-it-works"
      kicker="Method"
      title={
        <>
          How <span className="text-marketing-accent">FISCMAK</span> works
        </>
      }
      description="Career intelligence for physicians and GME programs — capture, coach, synthesize, and arrive at CCC with evidence already assembled."
    >
      <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step) => (
          <MarketingGlassPanel
            key={step.n}
            as="li"
            accent
            className="marketing-glass-hover group relative overflow-hidden p-6 md:p-7"
          >
            <div
              className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-marketing-accent/80 via-marketing-accent/40 to-transparent"
              aria-hidden
            />
            <div className="relative pl-3">
              <div className="mb-4 flex items-center gap-3">
                <span className="font-futura-bold flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marketing-accent/90 text-sm text-black shadow-[0_0_20px_rgba(169,255,92,0.35)]">
                  {step.n}
                </span>
                <h3 className="font-futura-bold text-lg leading-tight text-white">{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-white/70">{step.body}</p>
            </div>
          </MarketingGlassPanel>
        ))}
      </ol>
    </MarketingSection>
  );
}
