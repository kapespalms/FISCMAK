import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGuard>
        <OnboardingGuard>{children}</OnboardingGuard>
      </AuthGuard>
    </AppShell>
  );
}
