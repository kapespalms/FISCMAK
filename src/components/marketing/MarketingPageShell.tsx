import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingCanvas } from "@/components/marketing/MarketingGlass";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
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
          <MarketingHeader />
          <main id="main-content">{children}</main>
          <MarketingFooter />
        </div>
      </MarketingCanvas>
    </MarketingFontShell>
  );
}
