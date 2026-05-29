"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function ensureReady() {
      if (pathname.startsWith("/app/onboarding")) {
        if (!stepParam) {
          try {
            const response = await fetch("/api/v1/onboarding/progress");
            if (response.ok) {
              const data = (await response.json()) as { path?: string };
              if (!cancelled && data.path?.includes("step=")) {
                router.replace(data.path);
              }
            }
          } catch {
            /* fall through */
          }
        }
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const response = await fetch("/api/v1/onboarding/progress");
        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/login");
            return;
          }
          throw new Error("Could not load onboarding progress");
        }
        const data = (await response.json()) as { path?: string };
        if (cancelled) return;

        if (data.path?.startsWith("/app/onboarding")) {
          const pending =
            typeof sessionStorage !== "undefined"
              ? sessionStorage.getItem("fiscmak_onboarding_next")
              : null;
          router.replace(pending ?? data.path);
          return;
        }

        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    }

    void ensureReady();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, stepParam]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-forest-dark/70">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
