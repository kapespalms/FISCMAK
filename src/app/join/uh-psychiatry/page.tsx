import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";

const ONBOARDING_NEXT = "/app/onboarding?program=uh-psych-cmc";

export const metadata: Metadata = {
  title: "Join UH Psychiatry Residency — FISCMAK",
  description:
    "FISCMAK for University Hospitals Cleveland Medical Center Psychiatry residents — rotation evidence, ILP-ready reflections, and CCC narrative support.",
};

export default function JoinUhPsychiatryPage() {
  const signupHref = `/signup?next=${encodeURIComponent(ONBOARDING_NEXT)}`;
  const loginHref = `/login?next=${encodeURIComponent(ONBOARDING_NEXT)}`;

  return (
    <MarketingPageShell>
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="font-futura-bold text-sm uppercase tracking-wide text-marketing-accent">
            University Hospitals Cleveland Medical Center
          </p>
          <h1 className="font-futura-bold mt-4 text-4xl text-white md:text-5xl">
            Psychiatry Residency on FISCMAK
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-300">
            Capture rotation evidence, ILP-ready reflections, and semiannual CCC narrative — alongside
            MedHub, not instead of it. Your block schedule initials auto-fill PGY and current rotation
            during setup.
          </p>

          <ul className="mt-8 space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-marketing-accent">→</span>
              Program-locked Psychiatry profile with rotation vocabulary
            </li>
            <li className="flex gap-3">
              <span className="text-marketing-accent">→</span>
              Coach Mak tuned to trainee content and your origin story
            </li>
            <li className="flex gap-3">
              <span className="text-marketing-accent">→</span>
              Career Data vault for evals, ILP goals, and portfolio evidence
            </li>
          </ul>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href={signupHref}
              className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-center text-black transition hover:bg-white"
            >
              Create your account →
            </Link>
            <Link
              href={loginHref}
              className="font-futura-bold inline-block rounded border border-white/30 px-8 py-4 text-center text-white transition hover:border-white"
            >
              Already have an account? Sign in
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Not a UH Psychiatry resident?{" "}
            <Link href="/app/onboarding" className="text-gray-400 underline hover:text-white">
              Set up an individual physician workspace
            </Link>
          </p>
        </div>
      </section>
    </MarketingPageShell>
  );
}
