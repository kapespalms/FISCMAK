"use client";

import { cn } from "@/lib/utils";

export const LUXURY = {
  bg: "#FCFBF7",
  panel: "#FFFFFF",
  gold: "#AC8636",
} as const;

export function LuxuryCardHeader({
  title,
  description,
}: {
  cardIndex?: number;
  cardCount?: number;
  sectionLabel?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-2 font-futura-book">
      <h1 className="font-futura-bold text-2xl leading-tight tracking-[0.08em] text-cx-text md:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-cx-text/60">{description}</p>
      ) : null}
    </header>
  );
}

export function LuxuryWorkspace({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cx-forest-dark/10 bg-white p-8 shadow-[0_4px_24px_rgba(32,32,29,0.07)] md:p-12",
        className,
      )}
    >
      <div className="relative space-y-10">{children}</div>
    </div>
  );
}

export function LuxuryDivider() {
  return <hr className="border-cx-forest-dark/10" />;
}

export function LuxuryBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-futura-bold text-sm uppercase tracking-[0.15em] text-fis-gold">{label}</h3>
      {children}
    </div>
  );
}

export function LuxuryChoiceButton({
  active,
  onClick,
  children,
  className,
  mono,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-4 text-sm font-futura-medium tracking-wide transition-all",
        mono && "font-mono text-xs font-bold tracking-wider",
        active
          ? "border-fis-gold bg-fis-gold/8 text-cx-text ring-1 ring-fis-gold/20"
          : "border-cx-forest-dark/15 bg-white text-cx-text/70 hover:border-cx-forest-dark/30 hover:text-cx-text",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LuxuryTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  onBlur,
}: {
  id?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  onBlur?: () => void;
}) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      placeholder={placeholder}
      className={cn(
        "w-full resize-y rounded-xl border border-cx-forest-dark/20 bg-white px-5 py-4 text-sm text-cx-text transition-all placeholder:text-cx-text/40 focus:border-fis-gold focus:outline-none",
        className,
      )}
    />
  );
}

export function LuxuryTextInput({
  id,
  value,
  onChange,
  placeholder,
  readOnly,
  onBlur,
  className,
}: {
  id?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onBlur?: () => void;
  className?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onBlur={onBlur}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-xl border border-cx-forest-dark/20 bg-white px-5 py-4 text-sm text-cx-text transition-all placeholder:text-cx-text/40 focus:border-fis-gold focus:outline-none",
        readOnly && "opacity-70",
        className,
      )}
    />
  );
}

export function LuxuryHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("font-futura-book text-base leading-relaxed text-cx-text/60", className)}>
      {children}
    </p>
  );
}

export function LuxuryInfoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cx-forest-dark/10 bg-slate-50 px-4 py-3 text-sm text-cx-text/80">
      {children}
    </div>
  );
}

export function LuxuryNavFooter({
  onBack,
  onNext,
  backDisabled,
  nextLabel = "Continue",
  showBack = true,
}: {
  onBack?: () => void;
  onNext?: () => void;
  backDisabled?: boolean;
  nextLabel?: string;
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-cx-forest-dark/10 pt-6">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="font-futura-medium text-sm uppercase tracking-wider text-cx-text/60 transition-colors hover:text-cx-text disabled:opacity-40"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      {onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-cx-forest-dark px-10 py-4 font-futura-bold text-sm uppercase tracking-[0.2em] text-white shadow-sm transition-all hover:bg-cx-forest-dark/90 active:scale-[0.995]"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}
