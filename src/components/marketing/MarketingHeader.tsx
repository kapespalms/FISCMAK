import Link from "next/link";

const navigationItems = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Our Narrative", href: "#our-narrative" },
  { label: "Institutions", href: "#institutions" },
];

type MarketingHeaderProps = {
  overlay?: boolean;
};

export function MarketingHeader({ overlay = false }: MarketingHeaderProps) {
  return (
    <header
      className={
        overlay
          ? "absolute left-0 right-0 top-0 z-20 bg-transparent"
          : "sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-8 py-6 md:px-10 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="font-futura-bold text-4xl tracking-wide md:text-5xl lg:justify-self-start"
        >
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center justify-center gap-8 lg:flex lg:justify-self-center"
        >
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-futura-condensed text-base text-white transition hover:text-marketing-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-4 lg:justify-self-end">
          <Link
            href="/login"
            className="font-futura-bold hidden rounded border border-marketing-accent px-6 py-2.5 text-sm text-white transition hover:bg-marketing-accent hover:text-black sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="font-futura-bold rounded bg-marketing-accent px-6 py-2.5 text-sm text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}
