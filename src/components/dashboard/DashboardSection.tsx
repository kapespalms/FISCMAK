import Link from "next/link";
import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  title: string;
  subtitle: string;
  href: string;
  background: string;
  children: React.ReactNode;
  className?: string;
  tall?: boolean;
};

export function DashboardSection({
  title,
  subtitle,
  href,
  background,
  children,
  className,
  tall = false,
}: DashboardSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-fiscmak-border",
        tall && "min-h-[460px]",
        className,
      )}
    >
      <Link
        href={href}
        className="block shrink-0 px-5 py-4 transition-opacity hover:opacity-95"
        style={{ background }}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-fiscmak-ink/70">
          {title}
        </p>
        <h2 className="mt-0.5 text-lg font-semibold text-fiscmak-ink">{subtitle}</h2>
      </Link>
      <div className="flex flex-1 flex-col gap-3 bg-white p-4">{children}</div>
    </section>
  );
}
