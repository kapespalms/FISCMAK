"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { UH_PSYCH_PROGRAM_SLUG } from "@/lib/v2/programs/uh-residency-content";
import { programHasFullContent, getProgramBySlug } from "@/lib/v2/programs/registry";

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
        const slug = data.onboarding?.program_slug as string | null | undefined;
        const path = data.onboarding?.onboarding_path as string | null | undefined;
        const program = slug ? getProgramBySlug(slug) : null;
        const allowed =
          path === "institutional" &&
          slug === UH_PSYCH_PROGRAM_SLUG &&
          programHasFullContent(program);
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
      <div className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-8 text-center text-sm text-cx-forest-dark/70">
        Loading program access…
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-cx-forest-dark/15 bg-white/90 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cx-forest-dark/10">
          <Lock className="h-5 w-5 text-cx-forest-dark/70" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-cx-forest-dark">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-cx-forest-dark/70">
          This hub is available to University Hospitals psychiatry residents with an institutional
          program invite. Join via your program link or ask your coordinator for access.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/join/uh/psychiatry"
            className="rounded-lg bg-cx-forest-dark px-4 py-2 text-sm font-medium text-white hover:bg-cx-forest-dark/90"
          >
            UH Psychiatry join page
          </Link>
          <Link
            href="/app/dashboard"
            className="rounded-lg border border-cx-forest-dark/20 px-4 py-2 text-sm font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
