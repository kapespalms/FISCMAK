"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type ProfileCarouselCard = {
  id: string;
  label: string;
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
}: OnboardingProfileCarouselProps) {
  const current = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] px-4 py-3">
        <div>
          <p className="font-futura-medium text-xs uppercase tracking-wide text-cx-forest-dark/60">
            Step 1: Core Profile
          </p>
          <p className="font-futura-medium mt-0.5 text-base text-cx-forest-dark">
            {current?.label ?? "Profile"}
          </p>
        </div>
        <p className="font-futura-book text-sm text-cx-forest-dark/70">
          Card {index + 1} of {cards.length}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2" aria-hidden>
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => onIndexChange(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-8 bg-cx-forest-dark" : "w-2 bg-cx-forest-dark/25 hover:bg-cx-forest-dark/40",
            )}
            aria-label={`Go to ${card.label}`}
          />
        ))}
      </div>

      <div key={current?.id} className="min-h-[280px]">
        {children}
      </div>

      {error ? <p className="cx-alert-banner px-4 py-3 text-base">{error}</p> : null}

      {!hideNav && !isLast ? (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onPrev}
            disabled={isFirst}
            className="inline-flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
          <Button type="button" onClick={onNext} className="inline-flex items-center gap-1">
            Continue
            <ChevronRight size={16} />
          </Button>
        </div>
      ) : null}

      {!hideNav && isLast ? (
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onPrev}
            className="inline-flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Back
          </Button>
        </div>
      ) : null}
    </div>
  );
}
