import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { ProgramJoinSection } from "@/components/onboarding/ProgramJoinSection";
import { programSlugFromUhJoinSpecialty } from "@/lib/v2/programs/program-join-display";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

type PageProps = { params: Promise<{ specialty: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { specialty } = await params;
  const slug = programSlugFromUhJoinSpecialty(specialty);
  const program = slug ? getProgramBySlug(slug) : null;
  if (!program) {
    return { title: "Program not found — FISCMAK" };
  }
  return {
    title: `Join ${program.display_title} — FISCMAK`,
    description: `FISCMAK for ${program.program_name} at University Hospitals.`,
  };
}

export default async function JoinUhSpecialtyPage({ params }: PageProps) {
  const { specialty } = await params;
  const programSlug = programSlugFromUhJoinSpecialty(specialty);
  if (!programSlug) notFound();

  const program = getProgramBySlug(programSlug);
  if (!program) notFound();

  const onboardingNext = `/app/onboarding?program=${encodeURIComponent(program.slug)}`;
  const signupHref = `/signup?next=${encodeURIComponent(onboardingNext)}`;
  const loginHref = `/login?next=${encodeURIComponent(onboardingNext)}`;

  return (
    <MarketingPageShell>
      <ProgramJoinSection
        program={program}
        available
        signupHref={signupHref}
        loginHref={loginHref}
        altPathHref="/app/onboarding?path=public"
        altPathLabel="Not joining through a program? Continue on your own"
        programJoinHref={`/join/uh/${specialty}`}
      />
    </MarketingPageShell>
  );
}
