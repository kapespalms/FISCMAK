"use client";

import { cn } from "@/lib/utils";
import {
  LuxuryCardHeader,
  LuxuryNavFooter,
} from "@/components/onboarding/OnboardingLuxuryUi";

export type ProfileCarouselCard = {
  id: string;
  label: string;
  sectionLabel: string;
  title: string;
  description?: string;
};

type OnboardingProfileCarouselProps = {
  cards: ProfileCarouselCard[];
  index: number;
  onIndexChange: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
  error?: string;
  hideNav?: boolean;
  nextLabel?: string;
};

export function OnboardingProfileCarousel({
  cards,
  index,
  onIndexChange,
  onNext,
  onPrev,
  children,
  error,
  hideNav = false,
  nextLabel,
}: OnboardingProfileCarouselProps) {
  const current = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  return (
    <div className="w-full space-y-8 font-futura-book">
      {current ? (
        <LuxuryCardHeader
          cardIndex={index}
          cardCount={cards.length}
          sectionLabel={current.sectionLabel}
          title={current.title}
          description={current.description}
        />
      ) : null}

      <div className="flex items-center gap-3 pl-1">
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onIndexChange(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-8 bg-[#A3E635]" : "w-2 bg-white/20 hover:bg-white/35",
            )}
            aria-label={`Go to ${card.label}`}
          />
        ))}
      </div>

      <div key={current?.id}>{children}</div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-base text-red-200">
          {error}
        </p>
      ) : null}

      {!hideNav && !isLast ? (
        <LuxuryNavFooter
          onBack={onPrev}
          onNext={onNext}
          backDisabled={isFirst}
          nextLabel={nextLabel ?? "Continue"}
        />
      ) : null}

      {!hideNav && isLast ? (
        <LuxuryNavFooter onBack={onPrev} showBack nextLabel="" />
      ) : null}
    </div>
  );
}
