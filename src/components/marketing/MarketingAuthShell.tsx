import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export function MarketingAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <MarketingFontShell className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main-content" className="flex flex-1 flex-col bg-black">
        {children}
      </main>
      <MarketingFooter />
    </MarketingFontShell>
  );
}
