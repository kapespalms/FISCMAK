"use client";

import Link from "next/link";
import { HeartPulse } from "lucide-react";

type WellbeingData = {
  pulseDue:  boolean;
  fcwiDue:   boolean;
  pulseMdt:  number | null;
  pulseDate: string | null;
};

type Props = WellbeingData & { loading?: boolean };

/** Map the two due flags + MDT score to a plain-English "weather" phrase. */
function toWeatherReading({ pulseDue, fcwiDue, pulseMdt }: WellbeingData): {
  icon: string;
  text: string;
  sub:  string;
  color: string;
} {
  if (pulseDue && fcwiDue) {
    return { icon: "⏰", text: "Check-in due", sub: "Weekly pulse + FCWI both overdue", color: "text-amber-700" };
  }
  if (pulseDue) {
    return { icon: "⏰", text: "Pulse due", sub: "Weekly check-in is ready", color: "text-amber-600" };
  }
  if (fcwiDue) {
    return { icon: "📋", text: "FCWI due", sub: "Monthly fulfillment check-in", color: "text-amber-600" };
  }
  if (pulseMdt !== null && pulseMdt >= 4) {
    return { icon: "🌧", text: "Distress noted", sub: "Resources are available — you don't have to carry it alone", color: "text-sky-700" };
  }
  if (pulseMdt !== null && pulseMdt >= 2) {
    return { icon: "⛅", text: "Some strain", sub: "Check-in is up to date", color: "text-neutral-600" };
  }
  if (pulseMdt !== null) {
    return { icon: "☀️", text: "On track", sub: "Check-in is up to date", color: "text-fis-green" };
  }
  return { icon: "🌤", text: "No reading yet", sub: "Start a check-in when you're ready", color: "text-neutral-500" };
}

export function WellbeingReadingCard({ pulseDue, fcwiDue, pulseMdt, pulseDate, loading }: Props) {
  const reading = toWeatherReading({ pulseDue, fcwiDue, pulseMdt, pulseDate });

  return (
    <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse size={15} className="text-fis-green" />
          <span className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Well-being
          </span>
        </div>
        <Link href="/app/wellbeing" className="text-xs text-fis-gold hover:opacity-80">
          Open →
        </Link>
      </div>

      {loading ? (
        <div className="h-8 w-32 animate-pulse rounded-lg bg-neutral-100" />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{reading.icon}</span>
            <p className={`text-sm font-semibold ${reading.color}`}>{reading.text}</p>
          </div>
          <p className="mt-1 text-xs text-cx-forest-dark/55">{reading.sub}</p>
          {pulseDate && (
            <p className="mt-1.5 text-[10px] text-neutral-400">
              Last: {new Date(pulseDate).toLocaleDateString()}
            </p>
          )}
          {(pulseDue || fcwiDue) && (
            <Link
              href="/app/wellbeing"
              className="mt-3 block w-full rounded-xl border border-fis-green/30 bg-fis-green/5 py-2 text-center text-xs font-medium text-fis-green transition-colors hover:bg-fis-green/10"
            >
              Start check-in
            </Link>
          )}
        </>
      )}
    </div>
  );
}
