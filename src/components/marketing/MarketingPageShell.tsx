import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
  return (
    <MarketingFontShell className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main-content" className="bg-black">
        {children}
      </main>
      <MarketingFooter />
    </MarketingFontShell>
  );
}
