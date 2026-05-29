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
  const altPathCopy =
    altPathLabel ?? "Not joining through an institution? Continue on your own";

  return (
    <>
      <MarketingHeroSection program={program} variant="join" />

      <section className="px-8 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {available ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={signupHref}
                  className="font-futura-bold cx-btn inline-block bg-marketing-accent px-8 py-4 text-center text-black transition hover:bg-white"
                >
                  Create account
                </Link>
                <Link
                  href={loginHref}
                  className="font-futura-bold cx-btn inline-block border border-cx-forest-dark/30 px-8 py-4 text-center text-cx-forest-dark transition hover:border-cx-forest-dark"
                >
                  Sign in
                </Link>
              </div>
              {altPathHref ? (
                <p className="mt-4 text-sm text-cx-forest-dark/60">
                  <Link
                    href={altPathHref}
                    className="text-cx-forest-dark/75 underline hover:text-cx-forest-dark"
                  >
                    {altPathCopy}
                  </Link>
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="max-w-xl text-lg leading-relaxed text-cx-forest-dark/80">
                {unavailableMessage ??
                  "This invite link is no longer available. Contact your program coordinator for a new link."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={loginHref}
                  className="font-futura-bold cx-btn inline-block border border-cx-forest-dark/30 px-8 py-4 text-center text-cx-forest-dark transition hover:border-cx-forest-dark"
                >
                  Sign in
                </Link>
                <Link
                  href={programJoinHref ?? "/join/uh/psychiatry"}
                  className="font-futura-bold cx-btn inline-block px-8 py-4 text-center text-cx-forest-dark/60 underline transition hover:text-cx-forest-dark"
                >
                  Program join page
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
