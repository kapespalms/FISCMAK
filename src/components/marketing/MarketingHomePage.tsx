import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import { FiscmakNameSection } from "@/components/marketing/FiscmakNameSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export function MarketingHomePage() {
  return (
    <MarketingFontShell className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <div className="relative bg-black">
        <MarketingHeader overlay />
        <main id="main-content">
          <MarketingHeroSection />
        </main>
      </div>

      <FiscmakNameSection />
      <div className="bg-black">
        <HowItWorksSection />
      </div>
      <MarketingFooter />
    </MarketingFontShell>
  );
}
