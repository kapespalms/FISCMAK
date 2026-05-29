"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/app/onboarding")) {
      setReady(true);
      return;
    }

    let cancelled = false;

    fetch("/api/v1/onboarding/progress")
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return null;
          }
          throw new Error("Could not load onboarding progress");
        }
        return response.json();
      })
      .then((data) => {
        if (cancelled || !data) return;

        if (data.path?.startsWith("/app/onboarding")) {
          const pending =
            typeof sessionStorage !== "undefined"
              ? sessionStorage.getItem("fiscmak_onboarding_next")
              : null;
          router.replace(pending ?? data.path);
          return;
        }

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-forest-dark/70">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
