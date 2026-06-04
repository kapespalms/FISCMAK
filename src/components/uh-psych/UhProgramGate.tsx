"use client";

import { useEffect, useState, type ReactNode } from "react";
import { onboardingPathFromMetadata } from "@/lib/v2/onboarding-path";
import { hasUhPsychProgramAccess } from "@/lib/v2/programs/uh-program-access";
import { UhProgramUnauthorized } from "@/components/uh-psych/UhProgramUnauthorized";

type UhProgramGateProps = {
  children: ReactNode;
  title?: string;
};

type GateState = "loading" | "allowed" | "locked";

export function UhProgramGate({ children, title = "UH Psychiatry" }: UhProgramGateProps) {
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/onboarding/touchpoint1");
        if (!res.ok) {
          if (!cancelled) setState("locked");
          return;
        }
        const data = await res.json();
        const path = data.onboarding?.onboarding_path as "public" | "institutional" | null;
        const slug = data.onboarding?.program_slug as string | null | undefined;
        const programId = data.onboarding?.program_id as string | null | undefined;
        const allowed = hasUhPsychProgramAccess(
          onboardingPathFromMetadata({
            onboarding_path: path ?? undefined,
            program_slug: slug ?? undefined,
            program_id: programId ?? undefined,
          }),
        );
        if (!cancelled) setState(allowed ? "allowed" : "locked");
      } catch {
        if (!cancelled) setState("locked");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-8 text-center text-sm text-cx-text/70">
        Loading program access…
      </div>
    );
  }

  if (state === "locked") {
    return <UhProgramUnauthorized title={title} />;
  }

  return <>{children}</>;
}
