import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export function MarketingAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <MarketingFontShell className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="flex flex-1 flex-col bg-black">{children}</main>
    </MarketingFontShell>
  );
}
