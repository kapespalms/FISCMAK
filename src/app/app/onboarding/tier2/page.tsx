import { redirect } from "next/navigation";

/** Legacy route — documents step lives in unified onboarding. */
export default function Tier2OnboardingRedirectPage() {
  redirect("/app/onboarding?step=documents");
}
