import Link from "next/link";
import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

type ProgramJoinSectionProps = {
  program: Pick<ResidencyProgram, "institution_name" | "program_name" | "display_title">;
  available: boolean;
  unavailableMessage?: string;
  signupHref: string;
  loginHref: string;
  altPathHref?: string;
  altPathLabel?: string;
  programJoinHref?: string | null;
};

export function ProgramJoinSection({
  program,
  available,
  unavailableMessage,
  signupHref,
  loginHref,
  altPathHref,
  altPathLabel,
  programJoinHref,
}: ProgramJoinSectionProps) {
  return (
    <>
      <MarketingHeroSection program={program} />

      <section className="px-8 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {available ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={signupHref}
                className="font-futura-bold cx-btn inline-block bg-marketing-accent px-8 py-4 text-center text-black transition hover:bg-white"
              >
                Create account
              </Link>
              <Link
                href={loginHref}
                className="font-futura-bold cx-btn inline-block border border-white/30 px-8 py-4 text-center text-white transition hover:border-white"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <p className="max-w-xl text-lg leading-relaxed text-gray-300">
                {unavailableMessage ??
                  "This invite link is no longer available. Contact your program coordinator for a new link."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={loginHref}
                  className="font-futura-bold cx-btn inline-block border border-white/30 px-8 py-4 text-center text-white transition hover:border-white"
                >
                  Sign in
                </Link>
                <Link
                  href={programJoinHref ?? "/join/uh/psychiatry"}
                  className="font-futura-bold cx-btn inline-block px-8 py-4 text-center text-gray-400 underline transition hover:text-white"
                >
                  Program join page
                </Link>
              </div>
            </>
          )}

          {altPathHref && altPathLabel && (
            <p className="mt-10 text-sm text-gray-500">
              <Link href={altPathHref} className="text-gray-400 underline hover:text-white">
                {altPathLabel}
              </Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
