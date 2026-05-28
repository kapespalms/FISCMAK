import type { Metadata } from "next";
import Link from "next/link";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

export const metadata: Metadata = {
  title: "Security — FISCMAK",
  description: "How FISCMAK handles data privacy, encryption, and physician trust.",
};

const SECURITY_POINTS = [
  {
    title: "Encryption",
    body: "Data is encrypted in transit and at rest. Sessions use industry-standard auth and transport security.",
  },
  {
    title: "Private by default",
    body: "Your activity log and coaching conversations are yours. Individual data is not shared with employers without explicit program agreements.",
  },
  {
    title: "Role-based access",
    body: "Institutional dashboards show aggregated cohort insights — not surveillance of individual trainees unless your program configures otherwise with clear consent.",
  },
  {
    title: "Not clinical PHI",
    body: "FISCMAK is built for career intelligence — not patient records. Do not log protected health information in activity entries or chat.",
  },
] as const;

export default function SecurityPage() {
  return (
    <MarketingPageShell>
      <section className="relative px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-futura-bold text-3xl text-cx-forest-dark md:text-4xl lg:text-5xl">
            Security & <span className="text-marketing-accent">privacy</span>
          </h1>
          <p className="font-futura-medium mt-4 text-base leading-relaxed text-cx-forest-dark/70 md:text-lg">
            Career intelligence requires trust. FISCMAK LLC is built with physician privacy as a
            default — not an upsell.
          </p>

          <div className="mt-10 space-y-4">
            {SECURITY_POINTS.map((point) => (
              <MarketingGlassPanel key={point.title} accent className="p-6 md:p-8">
                <h2 className="font-futura-bold text-lg text-white">{point.title}</h2>
                <p className="font-futura-medium mt-2 text-sm leading-relaxed text-white/70 md:text-base">
                  {point.body}
                </p>
              </MarketingGlassPanel>
            ))}
          </div>

          <p className="font-futura-medium mt-10 text-sm text-cx-forest-dark/60">
            Questions?{" "}
            <Link href="/faq" className="text-marketing-accent transition hover:text-cx-forest-dark">
              See FAQ
            </Link>{" "}
            or use Connect with FISCMAK in the footer.
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
