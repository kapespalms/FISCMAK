import { marketingFontVariables } from "@/lib/fonts/marketing-fonts";
import { cn } from "@/lib/utils";

export function MarketingFontShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("marketing-page", marketingFontVariables, className)}>
      {children}
    </div>
  );
}
