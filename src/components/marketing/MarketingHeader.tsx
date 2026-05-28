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
          ? "absolute left-0 right-0 top-0 z-20 bg-transparent"
          : "sticky top-0 z-50 bg-[#030303]/95 backdrop-blur-xl"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 md:gap-4 md:px-10">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="shrink-0 font-futura-bold text-2xl tracking-wide sm:text-3xl md:text-4xl"
        >
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="flex min-w-0 flex-1 justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="marketing-glass flex shrink-0 items-center gap-0.5 rounded-full px-1 py-0.5">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-futura-bold shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] tracking-wide text-white transition hover:bg-white/10 hover:text-marketing-accent sm:px-3 sm:text-xs md:text-[13px]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="font-futura-bold cx-btn hidden shrink-0 whitespace-nowrap border border-white/20 bg-white/5 px-3 py-2 text-xs text-white backdrop-blur-sm transition hover:border-marketing-accent/40 hover:bg-white/10 sm:inline-block sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/app/onboarding"
            className="font-futura-bold cx-btn shrink-0 whitespace-nowrap bg-marketing-accent px-3 py-2 text-xs text-black shadow-[0_0_24px_rgba(169,255,92,0.25)] transition hover:bg-white hover:shadow-none sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Start Building
          </Link>
        </div>
      </div>

      <div className="mx-4 border-t border-white/10 md:mx-8" aria-hidden="true" />
    </header>
  );
}
