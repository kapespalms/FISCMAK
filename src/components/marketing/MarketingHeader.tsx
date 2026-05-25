import Link from "next/link";

const navigationItems = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Narrative", href: "/our-narrative" },
  { label: "Institutions", href: "/institutions" },
];

type MarketingHeaderProps = {
  overlay?: boolean;
};

export function MarketingHeader({ overlay = false }: MarketingHeaderProps) {
  return (
    <header
      className={
        overlay
          ? "absolute left-0 right-0 top-0 z-20 overflow-visible bg-transparent"
          : "relative sticky top-0 z-50 overflow-visible border-b border-white/10 bg-black/80 backdrop-blur-md"
      }
    >
      <nav
        aria-label="Primary navigation"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center lg:flex"
      >
        <div className="pointer-events-auto flex items-center gap-8">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-futura-condensed text-base text-white transition hover:text-marketing-accent"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between px-8 py-6 md:px-10">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="relative z-10 shrink-0 font-futura-bold text-4xl tracking-wide md:text-5xl"
        >
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </Link>

        <div className="relative z-10 ml-auto flex shrink-0 items-center justify-end gap-4">
          <Link
            href="/login"
            className="font-futura-bold hidden rounded border border-marketing-accent px-6 py-2.5 text-sm text-white transition hover:bg-marketing-accent hover:text-black sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/app/onboarding"
            className="font-futura-bold rounded bg-marketing-accent px-6 py-2.5 text-sm text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}
