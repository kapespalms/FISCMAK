"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/app/onboarding")) {
      setReady(true);
      return;
    }
    fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((u) => {
        if (!u.tier1_complete) {
          router.replace("/app/onboarding");
          return;
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-text-secondary">Loading…</p>
      </div>
    );
  }
  return <>{children}</>;
}
