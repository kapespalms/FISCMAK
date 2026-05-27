"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/app/onboarding")) {
      setReady(true);
      return;
    }

    let cancelled = false;

    fetch("/api/v1/users/me")
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.assign("/login");
            return null;
          }
          throw new Error("Could not load profile");
        }
        return response.json();
      })
      .then((user) => {
        if (cancelled || !user) return;

        if (!user.tier1_complete) {
          const pending =
            typeof sessionStorage !== "undefined"
              ? sessionStorage.getItem("fiscmak_onboarding_next")
              : null;
          window.location.assign(pending ?? "/app/onboarding");
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
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-forest-dark/70">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
