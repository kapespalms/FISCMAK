import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingCanvas } from "@/components/marketing/MarketingGlass";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import { FiscmakNameSection } from "@/components/marketing/FiscmakNameSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/**
 * MECE landing structure:
 * 1. Promise — hero value proposition
 * 2. Meaning — FISC · silent C · MAK
 * 3. Method — how it works + outcomes
 * 4. Contact — footer + form
 */
export function MarketingHomePage() {
  return (
    <MarketingFontShell className="min-h-full">
      <MarketingCanvas>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>

        <div className="relative z-[1]">
          <MarketingHeader overlay />
          <main id="main-content">
            <MarketingHeroSection />
            <FiscmakNameSection />
            <HowItWorksSection />
          </main>
          <MarketingFooter />
        </div>
      </MarketingCanvas>
    </MarketingFontShell>
  );
}
