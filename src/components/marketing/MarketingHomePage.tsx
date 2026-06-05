import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingCanvas } from "@/components/marketing/MarketingGlass";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import { FiscmakFlowSection } from "@/components/marketing/FiscmakFlowSection";
import { MeetMakLandingSection } from "@/components/marketing/MeetMakLandingSection";
import { InstitutionalPartnersSection } from "@/components/marketing/InstitutionalPartnersSection";
import { LandingDataOwnershipSection } from "@/components/marketing/LandingDataOwnershipSection";
import { LandingProofSection } from "@/components/marketing/LandingProofSection";
import { FiscmakMeaningGlassSection } from "@/components/marketing/FiscmakMeaningGlassSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * Landing page — 10-section MECE structure:
 * 1. Hero (value proposition)
 * 2. The four steps (Capture → See → Generate → Direct)
 * 3. Coach Mak (one consolidated section)
 * 4. Institutional partnerships (GME/PD value)
 * 5. Data ownership (privacy-by-design)
 * 6. Proof (physician voices)
 * 7. FISCMAK meaning (our narrative)
 * 8–10. Footer / nav / legal (footer)
 */
export function MarketingHomePage() {
  return (
    <MarketingFontShell className="min-h-full">
      <MarketingCanvas>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <div className="relative z-[1]">
          <MarketingHeader overlay />
          <main id="main-content">
            {/* 1. Hero */}
            <MarketingHeroSection />

            {/* 2. Four steps */}
            <FiscmakFlowSection />

            {/* 3. Coach Mak — single consolidated section */}
            <MeetMakLandingSection />

            {/* 4. Institutional partnerships */}
            <InstitutionalPartnersSection />

            {/* 5. Data ownership */}
            <LandingDataOwnershipSection />

            {/* 6. Proof */}
            <LandingProofSection />

            {/* 7. FISCMAK meaning */}
            <FiscmakMeaningGlassSection />
          </main>

          {/* 8–10. Footer */}
          <MarketingFooter />
        </div>
      </MarketingCanvas>
    </MarketingFontShell>
  );
}
