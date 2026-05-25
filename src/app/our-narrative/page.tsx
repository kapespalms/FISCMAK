import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { FoundersNarrativeSection } from "@/components/marketing/FiscmakNameSection";

export const metadata: Metadata = {
  title: "Our Narrative — FISCMAK",
  description:
    "Why we built FISCMAK — making invisible physician work visible through career intelligence.",
};

export default function OurNarrativePage() {
  return (
    <MarketingPageShell>
      <FoundersNarrativeSection />
    </MarketingPageShell>
  );
}
