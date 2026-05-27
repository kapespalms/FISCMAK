import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { FaqSection } from "@/components/marketing/FaqSection";

export const metadata: Metadata = {
  title: "FAQ — FISCMAK",
  description: "Frequently asked questions about FISCMAK career intelligence for physicians.",
};

export default function FaqPage() {
  return (
    <MarketingPageShell>
      <FaqSection />
    </MarketingPageShell>
  );
}
