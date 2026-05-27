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
  /** MECE section label — small caps kicker */
  kicker: string;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/** MECE section shell: kicker + title + optional description + content. */
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
        <p className="font-futura-medium text-xs uppercase tracking-[0.22em] text-marketing-accent/90">
          {kicker}
        </p>
        <h2 className="font-futura-bold mt-3 text-3xl text-white md:text-4xl lg:text-5xl">{title}</h2>
        {description ? (
          <p className="font-futura-medium mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            {description}
          </p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
