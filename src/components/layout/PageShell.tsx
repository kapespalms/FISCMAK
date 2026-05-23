import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "md" | "lg" | "xl" | "full";
};

const WIDTH = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-[1200px]",
  full: "max-w-[1400px]",
};

export function PageShell({
  title,
  subtitle,
  eyebrow,
  action,
  children,
  className,
  maxWidth = "xl",
}: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full", WIDTH[maxWidth], className)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="text-cx-label uppercase tracking-wide">{eyebrow}</p>}
          <h1 className="text-cx-h1">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-cx-body">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </div>
  );
}
