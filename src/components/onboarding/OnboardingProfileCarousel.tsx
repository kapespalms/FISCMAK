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
  variant?: "default" | "elevated";
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
  variant = "default",
}: OnboardingProfileCarouselProps) {
  const current = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;
  const elevated = variant === "elevated";

  if (elevated) {
    return (
      <div className="w-full space-y-12 py-6 md:py-10">
        <header className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A3E635]">
            Step 1: Core Profile
          </span>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Account Initialization
            </h1>
            <span className="rounded-lg border border-white/5 bg-[#141722] px-3 py-1.5 font-mono text-sm text-gray-500">
              Card {index + 1} of {cards.length}
            </span>
          </div>
        </header>

        <div className="flex items-center gap-3 pl-1" aria-hidden>
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

        {!hideNav && isLast ? (
          <div>
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        ) : null}
      </div>
    );
  }

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
