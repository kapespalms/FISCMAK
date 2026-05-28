import { cn } from "@/lib/utils";

/** Ambient marketing canvas — single dark surface with soft accent glows. */
export function MarketingCanvas({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("marketing-canvas relative min-h-full overflow-x-hidden", className)}>
      <div className="marketing-canvas-glow pointer-events-none" aria-hidden />
      {children}
    </div>
  );
}

type MarketingGlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  /** accent = subtle lime border glow */
  accent?: boolean;
  as?: "div" | "article" | "section" | "li";
};

/** Frosted glass panel for marketing sections. */
export function MarketingGlassPanel({
  children,
  className,
  accent = false,
  as: Tag = "div",
}: MarketingGlassPanelProps) {
  return (
    <Tag
      className={cn(
        "marketing-glass rounded-2xl",
        accent && "marketing-glass-accent",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type MarketingSectionProps = {
  id?: string;
  /** Optional small-caps label above the title */
  kicker?: string;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/** Section shell: optional kicker + title + description + content. */
export function MarketingSection({
  id,
  kicker,
  title,
  description,
  children,
  className,
}: MarketingSectionProps) {
  return (
    <section id={id} className={cn("relative px-6 py-16 md:px-10 md:py-20", className)}>
      <div className="relative mx-auto max-w-6xl">
        {kicker ? (
          <p className="font-futura-medium text-xs uppercase tracking-[0.22em] text-marketing-accent/90">
            {kicker}
          </p>
        ) : null}
        <h2
          className={cn(
            "font-futura-bold text-3xl text-cx-forest-dark md:text-4xl lg:text-5xl",
            kicker ? "mt-3" : undefined,
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="font-futura-bold mt-4 max-w-2xl text-base leading-relaxed text-cx-forest-dark/80 md:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
