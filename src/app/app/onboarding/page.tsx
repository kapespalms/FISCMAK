import { Suspense } from "react";
import { Touchpoint1Onboarding } from "@/components/onboarding/Touchpoint1Onboarding";

function OnboardingFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-cx-text/70">Loading onboarding…</p>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <Touchpoint1Onboarding />
    </Suspense>
  );
}
