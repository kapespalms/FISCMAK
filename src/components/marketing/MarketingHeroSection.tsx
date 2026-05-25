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
    <p className="font-futura-condensed whitespace-nowrap text-lg md:text-xl lg:text-2xl">
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
      <div className="relative w-full max-w-6xl">
        <div className="inline-grid grid-cols-[auto_auto_auto] gap-x-[0.35em] text-4xl uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]">
          <h1 className="contents font-futura-bold">
            <span className="col-start-1 row-start-1">What</span>
            <span className="col-start-2 row-start-1">move</span>
            <span className="col-start-3 row-start-1 text-marketing-accent">honors</span>
            <span className="col-start-2 row-start-2">your</span>
            <span className="col-start-3 row-start-2">work?</span>
          </h1>
          <p className="col-start-2 col-span-2 row-start-3 mt-3 max-w-md font-futura-condensed text-base normal-case tracking-normal text-white md:mt-4 md:text-lg lg:text-xl">
            An intelligent career platform for physicians.
          </p>
          <div className="col-start-2 col-span-2 row-start-4 mt-5 flex flex-col gap-2 md:mt-6 md:flex-row md:flex-wrap md:gap-x-8 lg:gap-x-10">
            <HeroTagline verb="Capture" middle="the" end="invisible." />
            <HeroTagline verb="Clarify" middle="your" end="direction." />
            <HeroTagline verb="Build" middle="the career" end="you want." />
          </div>
        </div>
      </div>
    </section>
  );
}
