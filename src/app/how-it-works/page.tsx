import type { Metadata } from "next";
import { CoachMakDeepDiveSection } from "@/components/marketing/CoachMakDeepDiveSection";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";

export const metadata: Metadata = {
  title: "How It Works — FISCMAK",
  description:
    "Capture your work, map your career arc, and build evidence-backed narratives — with Coach Mak for mentorship and career coaching.",
};

export default function HowItWorksPage() {
  return (
    <MarketingPageShell>
      <HowItWorksSection />
      <CoachMakDeepDiveSection />
    </MarketingPageShell>
  );
}
