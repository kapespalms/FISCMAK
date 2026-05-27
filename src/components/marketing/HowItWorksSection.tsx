import { MarketingGlassPanel, MarketingSection } from "@/components/marketing/MarketingGlass";

const STEPS = [
  {
    n: 1,
    title: "Capture",
    body: "Log what you actually do — clinical work, teaching, mentorship, invisible hours.",
  },
  {
    n: 2,
    title: "Understand",
    body: "Coach Mak reads patterns in energy, fulfillment, and direction — privately.",
  },
  {
    n: 3,
    title: "Document",
    body: "Turn lived work into CV lines, promotion language, and review-ready narratives.",
  },
  {
    n: 4,
    title: "Move",
    body: "See what comes next — goals, opportunities, and trajectory over time.",
  },
] as const;

const OUTCOMES = [
  {
    title: "For physicians",
    items: [
      "Career clarity without another survey portal",
      "Evidence that reflects real work",
      "Wellbeing signals — never surveillance scores",
    ],
  },
  {
    title: "For programs",
    items: [
      "Pre-CCC prep in minutes, not hours",
      "Milestone visibility with equity guardrails",
      "Longitudinal cohort view for CCC conversations",
    ],
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
      description="Four steps. One coach. Your career story — captured, clarified, and ready when it matters."
    >
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step) => (
          <MarketingGlassPanel
            key={step.n}
            as="li"
            className="marketing-glass-hover p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="font-futura-bold flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marketing-accent text-sm text-black">
                {step.n}
              </span>
              <h3 className="font-futura-bold text-lg text-white">{step.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-white/65">{step.body}</p>
          </MarketingGlassPanel>
        ))}
      </ol>

      <MarketingGlassPanel accent className="mt-8 p-8 md:mt-10 md:p-10">
        <h3 className="font-futura-bold text-2xl text-white md:text-3xl">Why it matters</h3>
        <p className="font-futura-medium mt-2 max-w-2xl text-sm text-white/60 md:text-base">
          Two audiences. One platform. No overlap — built for the people doing the work and the
          programs responsible for their development.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {OUTCOMES.map((col) => (
            <div key={col.title}>
              <p className="font-futura-bold mb-3 text-marketing-accent">{col.title}</p>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-relaxed text-white/75 md:text-base"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marketing-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </MarketingGlassPanel>
    </MarketingSection>
  );
}
