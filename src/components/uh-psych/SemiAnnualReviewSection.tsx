"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import {
  SEMI_ANNUAL_MEETING,
  SEMI_ANNUAL_REVIEW_ITEMS,
} from "@/lib/v2/programs/uh-psych-hub-sections";

export function SemiAnnualReviewSection() {
  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/90 p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/55">
        {SEMI_ANNUAL_MEETING.title}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-cx-text">
        Meeting with {SEMI_ANNUAL_MEETING.hosts}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-cx-text/75">{SEMI_ANNUAL_MEETING.cadence}</p>

      <ul className="mt-4 space-y-2">
        {SEMI_ANNUAL_REVIEW_ITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="group flex gap-3 rounded-xl border border-cx-forest-dark/10 px-3 py-2.5 transition hover:border-cx-forest-dark/25 hover:bg-cx-forest-dark/[0.03]"
            >
              <Circle
                className="mt-0.5 h-4 w-4 shrink-0 text-cx-text/35 group-hover:text-cx-text/55"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-cx-text">{item.label}</p>
                <p className="text-xs text-cx-text/65">{item.detail}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-3 flex items-start gap-2 text-xs text-cx-text/60">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Use Mak to draft talking points before your semi-annual — CV updates, goal progress, and
        eval themes.
      </p>
    </section>
  );
}
