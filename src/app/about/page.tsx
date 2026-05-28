import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { FoundersNarrativeSection } from "@/components/marketing/FiscmakNameSection";

export const metadata: Metadata = {
  title: "About FISCMAK",
  description:
    "The meaning behind FISCMAK — hidden treasury, invisible work, and the highest standard in physician career intelligence.",
};

export default function AboutPage() {
  return (
    <MarketingPageShell>
      <FoundersNarrativeSection />
    </MarketingPageShell>
  );
}
