import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";

function OnboardingGuardFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-cx-text/70">Loading…</p>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGuard>
        <Suspense fallback={<OnboardingGuardFallback />}>
          <OnboardingGuard>{children}</OnboardingGuard>
        </Suspense>
      </AuthGuard>
    </AppShell>
  );
}
