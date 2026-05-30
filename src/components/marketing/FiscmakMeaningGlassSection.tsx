"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LANDING_PANEL_FISC_SRC,
  LANDING_PANEL_MAK_SRC,
  LANDING_PANEL_SILENT_C_SRC,
} from "@/lib/brand-assets";
import { MarketingGlassPanel } from "@/components/marketing/MarketingGlass";
import { MarketingPanelImage } from "@/components/marketing/MarketingPanelImage";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    key: "fisc",
    title: "FISC",
    subtitle: "Fiscus",
    heading: "The hidden treasury",
    traits: ["Expertise", "Dedication", "Time"],
    footer: "A physician's most valuable treasure.",
    image: LANDING_PANEL_FISC_SRC,
    imageAlt: "Chessboard — expertise and dedication as hidden value",
  },
  {
    key: "silent-c",
    title: "Silent C",
    subtitle: "Unspoken",
    heading: "The invisible work",
    traits: ["Essential", "Dynamic", "Triumphant"],
    footer: "A physician's whole career, fully seen.",
    image: LANDING_PANEL_SILENT_C_SRC,
    imageAlt: "Chess king — invisible work made visible",
  },
  {
    key: "mak",
    title: "MAK",
    subtitle: "Maximus",
    heading: "Professional agency",
    traits: ["Empowered", "Deliberate", "Transformative"],
    footer: "Reach your maximum potential.",
    image: LANDING_PANEL_MAK_SRC,
    imageAlt: "Chess board — career at full potential",
  },
] as const;

type PillarKey = (typeof PILLARS)[number]["key"];

function PillarDetail({ pillar }: { pillar: (typeof PILLARS)[number] }) {
  return (
    <div className="pillar-detail-pop mt-3 space-y-2 border-t border-white/10 pt-3 text-left">
      <p className="font-futura-bold text-lg text-marketing-accent">{pillar.title}</p>
      <p className="font-futura-medium text-xs italic text-white/50">{pillar.subtitle}</p>
      <p className="font-futura-bold text-sm text-white md:text-base">{pillar.heading}</p>
      <ul className="space-y-0.5">
        {pillar.traits.map((trait) => (
          <li key={trait} className="font-futura-medium text-sm text-marketing-accent/95">
            {trait}.
          </li>
        ))}
      </ul>
      <p className="font-futura-medium text-sm leading-relaxed text-white/70">{pillar.footer}</p>
    </div>
  );
}

function PaintingButton({
  pillar,
  selected,
  onSelect,
}: {
  pillar: (typeof PILLARS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={selected}
        aria-label={`${pillar.title} — ${pillar.heading}`}
        className={cn(
          "group w-full rounded-xl border bg-[#030303] p-1.5 text-left transition duration-300",
          selected
            ? "border-marketing-accent/50 shadow-[0_0_24px_rgba(169,255,92,0.12)]"
            : "border-white/10 hover:border-marketing-accent/30",
        )}
      >
        <MarketingPanelImage
          src={pillar.image}
          alt={pillar.imageAlt}
          variant="tile"
          className={cn(
            "transition duration-300",
            selected ? "scale-[1.02]" : "group-hover:scale-[1.01]",
          )}
        />
      </button>
      {selected ? <PillarDetail pillar={pillar} /> : null}
    </div>
  );
}

export function FiscmakMeaningGlassSection() {
  const [active, setActive] = useState<PillarKey | null>(null);

  return (
    <section
      id="about-fiscmak"
      aria-label="What FISCMAK means"
      className="relative px-6 pb-12 md:px-10 md:pb-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-futura-bold text-2xl text-white md:text-3xl">
              <span className="text-marketing-accent">FISC</span>
              <span className="text-white">MAK</span>
            </h2>
            <p className="font-futura-medium mt-1 text-sm text-white/60 md:text-base">
              Pronounced <span className="text-marketing-accent">[ FIZ-MAK ]</span>
            </p>
          </div>
          <Link
            href="/our-narrative"
            className="font-futura-bold cx-btn shrink-0 self-start border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white backdrop-blur-sm transition hover:border-marketing-accent/40 hover:bg-white/10 sm:self-auto"
          >
            Our Narrative
          </Link>
        </div>

        <MarketingGlassPanel accent className="mt-5 overflow-hidden p-6 md:p-8 lg:p-10">
          <div className="max-w-2xl">
            <p className="font-futura-medium text-base leading-relaxed text-white/70">
              By the standard rules of grammar, you should pronounce the C in FISC.
            </p>
            <p className="font-futura-medium mt-2 text-base leading-relaxed text-marketing-accent">
              We don&apos;t follow the rules here.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
            {PILLARS.map((pillar) => (
              <PaintingButton
                key={pillar.key}
                pillar={pillar}
                selected={active === pillar.key}
                onSelect={() =>
                  setActive((current) => (current === pillar.key ? null : pillar.key))
                }
              />
            ))}
          </div>
        </MarketingGlassPanel>
      </div>
    </section>
  );
}
