"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

type CreditLimitModalProps = {
  open: boolean;
  onClose: () => void;
  upgradePrompt?: string | null;
};

export function CreditLimitModal({ open, onClose, upgradePrompt }: CreditLimitModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-limit-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="credit-limit-title" className="text-lg font-semibold text-cx-text">
          Free messages used
        </h2>
        <p className="mt-2 text-sm text-cx-text/80">
          {upgradePrompt ??
            "You've used your free AI coaching messages for now. Upgrade to Premium for unlimited Mak conversations."}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/app/settings"
            className="inline-flex min-h-11 flex-1 items-center justify-center bg-cx-forest-dark px-6 py-3 font-futura-medium text-base font-semibold text-white transition-colors hover:bg-cx-forest-dark/90"
          >
            Upgrade to Premium
          </Link>
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
