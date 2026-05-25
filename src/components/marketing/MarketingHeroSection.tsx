function HeroTagline({
  verb,
  middle,
  end,
}: {
  verb: string;
  middle: string;
  end: string;
}) {
  return (
    <p className="font-futura-condensed whitespace-nowrap text-base md:text-lg lg:text-xl">
      <span className="text-marketing-accent">{verb}</span>{" "}
      <span className="text-white">{middle}</span>{" "}
      <span className="text-marketing-gold">{end}</span>
    </p>
  );
}

export function MarketingHeroSection() {
  return (
    <section
      id="hero-value-proposition"
      aria-label="Hero value proposition"
      className="relative flex min-h-[min(720px,85svh)] items-start justify-start px-8 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36 lg:px-16 lg:pt-40"
    >
      <div className="relative max-w-4xl text-left">
        <h1 className="font-futura-bold grid grid-cols-[auto_auto_auto] gap-x-[0.35em] text-4xl uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]">
          <span className="col-start-1 row-start-1">What</span>
          <span className="col-start-2 row-start-1">move</span>
          <span className="col-start-3 row-start-1 text-marketing-accent">honors</span>
          <span className="col-start-2 row-start-2">your</span>
          <span className="col-start-3 row-start-2">work?</span>
        </h1>

        <p className="font-futura-condensed mt-5 max-w-md text-base text-white md:mt-6 md:text-lg lg:text-xl">
          An intelligent career platform for physicians.
        </p>

        <div className="mt-6 flex flex-col gap-2 md:mt-8 md:flex-row md:flex-wrap md:gap-x-8 lg:gap-x-10">
          <HeroTagline verb="Capture" middle="the" end="invisible." />
          <HeroTagline verb="Clarify" middle="your" end="direction." />
          <HeroTagline verb="Build" middle="the career" end="you want." />
        </div>
      </div>

      <a
        href="#contact"
        className="font-futura-condensed absolute bottom-8 left-8 text-sm uppercase tracking-[0.2em] text-white transition hover:opacity-80 md:bottom-12 md:left-10 md:text-base lg:left-16"
      >
        Connect with FISC
        <span className="text-marketing-accent">MAK</span>
      </a>
    </section>
  );
}
