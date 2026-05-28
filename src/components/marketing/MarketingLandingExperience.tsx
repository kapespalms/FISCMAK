"use client";

import { useState } from "react";
import { FiscMakLightBox } from "@/components/marketing/FiscMakLightBox";
import { LandingMakConsole } from "@/components/marketing/LandingMakConsole";

export function MarketingLandingExperience() {
  const [illuminated, setIlluminated] = useState(false);

  return (
    <section
      id="hero-value-proposition"
      aria-label="FISCMAK landing experience"
      className="relative px-4 pb-8 pt-24 sm:px-6 md:px-8 md:pt-28 lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[10px] border border-zinc-800/80 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95)]">
          <FiscMakLightBox
            embedded
            onIlluminated={() => setIlluminated(true)}
          />
          <LandingMakConsole visible={illuminated} />
        </div>
      </div>
    </section>
  );
}
