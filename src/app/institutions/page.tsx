import type { Metadata } from "next";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { InstitutionalPartnersSection } from "@/components/marketing/InstitutionalPartnersSection";

export const metadata: Metadata = {
  title: "Institutional Partnerships — FISCMAK",
  description:
    "See how leading residency programs transform physician development with FISCMAK.",
};

export default function InstitutionsPage() {
  return (
    <MarketingPageShell>
      <InstitutionalPartnersSection />
    </MarketingPageShell>
  );
}
