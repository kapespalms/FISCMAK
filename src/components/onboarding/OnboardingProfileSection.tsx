"use client";

import { cn } from "@/lib/utils";

type OnboardingProfileSectionProps = {
  /** Optional step label, e.g. "1" or "Step 1" */
  step?: string;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
};

/** MECE section block for onboarding profile — forest green headings, black body copy. */
export function OnboardingProfileSection({
  step,
  title,
  description,
  className,
  children,
}: OnboardingProfileSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-cx-forest-dark/15 bg-white px-5 py-5 md:px-6",
        className,
      )}
    >
      <header className="border-b border-cx-forest-dark/10 pb-4">
        {step && (
          <p className="font-futura-medium text-sm uppercase tracking-wide text-cx-forest-dark">
            {step}
          </p>
        )}
        <h2 className="font-futura-medium text-xl text-cx-forest-dark">{title}</h2>
        {description && (
          <p className="font-futura-book mt-2 text-base leading-relaxed text-black">{description}</p>
        )}
      </header>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Subheading inside a profile section. */
export function OnboardingProfileSubheading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="pt-1">
      <h3 className="font-futura-medium text-base text-cx-forest-dark">{title}</h3>
      {description && (
        <p className="font-futura-book mt-1 text-base leading-relaxed text-black">{description}</p>
      )}
    </div>
  );
}

/** Helper line — black, readable minimum size. */
export function OnboardingProfileHint({ children }: { children: React.ReactNode }) {
  return <p className="font-futura-book text-sm leading-relaxed text-black">{children}</p>;
}

/** Field group label — forest green. */
export function OnboardingFieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="font-futura-medium block text-base text-cx-forest-dark">
      {children}
    </label>
  );
}

/** Choice button for onboarding profile pickers. */
export function OnboardingChoiceButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-futura-book rounded-lg border px-3 py-3 text-left text-base text-black transition-colors",
        active
          ? "border-cx-forest-dark bg-cx-forest-dark/10 font-futura-medium"
          : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5",
        className,
      )}
    >
      {children}
    </button>
  );
}
