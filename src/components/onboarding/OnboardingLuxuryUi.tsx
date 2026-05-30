"use client";

import { cn } from "@/lib/utils";

export const LUXURY = {
  bg: "#0A0C10",
  panel: "#141722",
  lime: "#A3E635",
  gold: "#D4AF37",
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
    <header className="space-y-3 font-futura-book">
      <h1 className="font-futura-bold text-3xl uppercase leading-tight tracking-[0.12em] text-white md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-gray-400">{description}</p>
      ) : null}
    </header>
  );
}

export function LuxuryWorkspace({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-[#141722] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.6)] md:p-12",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 bg-[#0F3A20] opacity-15 blur-[100px]"
        aria-hidden
      />
      <div className="relative space-y-10">{children}</div>
    </div>
  );
}

export function LuxuryDivider() {
  return <hr className="border-white/5" />;
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
      <h3 className="font-futura-bold text-sm uppercase tracking-[0.15em] text-[#D4AF37]">{label}</h3>
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
          ? "border-[#A3E635] bg-[#1C2030] text-white shadow-[0_0_15px_rgba(163,230,53,0.1)]"
          : "border-white/5 bg-[#0A0C10] text-gray-400 hover:border-white/10 hover:text-white",
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
        "w-full resize-y rounded-xl border border-white/5 bg-[#0A0C10] px-5 py-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-[#A3E635] focus:outline-none",
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
        "w-full rounded-xl border border-white/5 bg-[#0A0C10] px-5 py-4 text-sm text-white transition-all placeholder:text-gray-600 focus:border-[#A3E635] focus:outline-none",
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
    <p className={cn("font-futura-book text-base leading-relaxed text-gray-400", className)}>
      {children}
    </p>
  );
}

export function LuxuryInfoPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0A0C10] px-4 py-3 text-sm text-gray-300">
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
    <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-6">
      {showBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={backDisabled}
          className="font-futura-medium text-sm uppercase tracking-wider text-gray-400 transition-colors hover:text-white disabled:opacity-40"
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
          className="rounded-xl bg-white px-10 py-4 font-futura-bold text-sm uppercase tracking-[0.2em] text-[#0A0C10] shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition-all hover:bg-gray-200 active:scale-[0.995]"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}
