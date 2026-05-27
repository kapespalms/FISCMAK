import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingPageShell } from "@/components/marketing/MarketingPageShell";
import { ProgramJoinSection } from "@/components/onboarding/ProgramJoinSection";
import {
  lookupInviteToken,
  onboardingUrlForToken,
} from "@/lib/v2/programs/invite-tokens";
import { uhJoinPathForProgramSlug } from "@/lib/v2/programs/program-join-display";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const preview = await lookupInviteToken(token);
  if (!preview.valid) {
    return { title: "Invite not found — FISCMAK" };
  }
  return {
    title: `Join ${preview.program_title ?? "program"} — FISCMAK`,
    description: `Activate your FISCMAK resident platform for ${preview.program_title ?? "your program"}.`,
  };
}

export default async function JoinTokenPage({ params }: PageProps) {
  const { token } = await params;
  const preview = await lookupInviteToken(token);

  if (!preview.valid) {
    notFound();
  }

  const program =
    getProgramBySlug(preview.program_slug) ?? {
      institution_name: preview.institution_name ?? "Program invite",
      program_name: preview.program_title ?? "Residency",
      display_title: preview.program_title ?? "Join FISCMAK",
    };

  const onboardingNext = onboardingUrlForToken(token);
  const signupHref = `/signup?next=${encodeURIComponent(onboardingNext)}`;
  const loginHref = `/login?next=${encodeURIComponent(onboardingNext)}`;

  return (
    <MarketingPageShell>
      <ProgramJoinSection
        program={program}
        available={preview.available}
        unavailableMessage={preview.message}
        signupHref={signupHref}
        loginHref={loginHref}
        programJoinHref={uhJoinPathForProgramSlug(preview.program_slug)}
      />
    </MarketingPageShell>
  );
}
