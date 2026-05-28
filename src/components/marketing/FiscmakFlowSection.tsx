import Link from "next/link";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";

const FLOW_STEPS = [
  { key: "capture", label: "Capture", line: "Log work before it fades." },
  { key: "map", label: "Map", line: "See patterns in your arc." },
  { key: "build", label: "Build", line: "Turn evidence into narrative." },
  { key: "claim", label: "Claim Your Career", line: "Own the direction you've been building." },
] as const;

export function FiscmakFlowSection() {
  return (
    <section
      id="how-it-works"
      aria-label="The FISCMAK Flow"
      className="relative px-6 py-10 md:px-10 md:py-12"
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-futura-bold text-2xl text-white md:text-3xl">
              The <span className="text-marketing-accent">FISCMAK</span> Flow
            </h2>
            <p className="font-futura-bold mt-1 max-w-xl text-sm text-white md:text-base">
              Invisible work → career clarity.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="font-futura-bold cx-btn shrink-0 self-start border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white backdrop-blur-sm transition hover:border-marketing-accent/40 hover:bg-white/10 sm:self-auto"
          >
            How It Works
          </Link>
        </div>

        <MarketingGlassPanel accent className="relative mt-5 overflow-hidden px-4 py-5 md:px-6 md:py-6">
          <div className="fiscmak-flow-track hidden md:block" aria-hidden>
            <div className="fiscmak-flow-pulse" />
          </div>

          <ol className="relative grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-4 md:gap-4">
            {FLOW_STEPS.map((step, index) => (
              <li key={step.key} className="fiscmak-flow-step group">
                <div className="flex items-baseline gap-2 md:flex-col md:items-start md:gap-1">
                  <span className="font-futura-bold shrink-0 text-sm text-marketing-accent/80 md:text-base">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-futura-bold text-base text-white md:text-lg">{step.label}</h3>
                    <p className="font-futura-bold mt-0.5 text-xs leading-snug text-white md:text-sm">
                      {step.line}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </MarketingGlassPanel>
      </div>
    </section>
  );
}
