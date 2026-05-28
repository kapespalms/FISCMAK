import Link from "next/link";

const navigationItems = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Meet Mak", href: "/meet-mak" },
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
          ? "absolute left-0 right-0 top-0 z-20"
          : "sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl"
      }
    >
      <nav
        aria-label="Primary navigation"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center lg:flex"
      >
        <div className="marketing-glass pointer-events-auto flex items-center gap-1 rounded-full px-2 py-1.5">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="font-futura-bold rounded-full px-4 py-2 text-sm text-white transition hover:bg-white/10 hover:text-marketing-accent"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="relative z-10 shrink-0 font-futura-bold text-3xl tracking-wide md:text-4xl"
        >
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </Link>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-3">
          <Link
            href="/login"
            className="font-futura-bold cx-btn hidden border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white backdrop-blur-sm transition hover:border-marketing-accent/40 hover:bg-white/10 sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/app/onboarding"
            className="font-futura-bold cx-btn bg-marketing-accent px-5 py-2.5 text-sm text-black shadow-[0_0_24px_rgba(169,255,92,0.25)] transition hover:bg-white hover:shadow-none"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}
