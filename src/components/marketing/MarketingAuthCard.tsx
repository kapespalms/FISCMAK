import { cn } from "@/lib/utils";

type MarketingAuthCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function MarketingAuthPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 md:py-16">
      {children}
    </div>
  );
}

export function MarketingAuthCard({ children, className }: MarketingAuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-white/10 bg-[#1a2419] px-8 py-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
