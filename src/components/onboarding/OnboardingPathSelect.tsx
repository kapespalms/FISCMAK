"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type OnboardingPathSelectProps = {
  loading?: boolean;
  onSelectPublic: () => void;
};

/** Fallback when someone reaches onboarding without a program invite token in the URL. */
export function OnboardingPathSelect({ loading, onSelectPublic }: OnboardingPathSelectProps) {
  return (
    <Card>
      <h1 className="text-page-title">How are you joining?</h1>
      <p className="mt-2 text-sm text-cx-forest-dark/80">
        Residency and fellowship residents should use the personal invite link from their program —
        not this page. That link attaches your program slot automatically.
      </p>

      <div className="mt-8 space-y-4">
        <div className="cx-surface-elevated rounded-2xl border border-cx-forest-dark/10 p-5">
          <p className="font-semibold text-cx-forest-dark">Residency or fellowship</p>
          <p className="mt-2 text-sm text-cx-forest-dark/70">
            Open the invite URL your program sent you (it looks like{" "}
            <span className="font-medium">/join/your-token</span>), then create an account or sign
            in from that page.
          </p>
          <Link
            href="/join/uh/psychiatry"
            className="font-futura-medium mt-4 inline-flex min-h-11 items-center justify-center rounded-none bg-cx-forest-dark px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-cx-forest-dark/90"
          >
            University Hospitals program join pages
          </Link>
        </div>

        <div className="cx-surface-elevated rounded-2xl border border-cx-forest-dark/10 p-5">
          <p className="font-semibold text-cx-forest-dark">Individual physician</p>
          <p className="mt-1 text-sm text-cx-forest-dark/70">
            Attending or unaffiliated — personal career platform.
          </p>
          <Button
            variant="secondary"
            className="mt-4 w-full sm:w-auto"
            disabled={loading}
            onClick={onSelectPublic}
          >
            Continue as individual
          </Button>
        </div>
      </div>
    </Card>
  );
}
