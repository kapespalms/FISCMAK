"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type OnboardingTermsAcceptanceCardProps = {
  chatConfidential: boolean;
  summativeReports: boolean;
  documentOwnership: boolean;
  onChatConfidentialChange: (value: boolean) => void;
  onSummativeReportsChange: (value: boolean) => void;
  onDocumentOwnershipChange: (value: boolean) => void;
  onAccept: () => void;
  loading?: boolean;
  disabled?: boolean;
};

function AcceptanceCheckbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
        checked
          ? "border-cx-forest-dark/25 bg-cx-forest-dark/[0.04]"
          : "border-cx-forest-dark/15 bg-white hover:bg-cx-forest-dark/[0.02]",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-cx-forest-dark"
      />
      <span className="font-futura-book text-sm leading-relaxed text-black">{children}</span>
    </label>
  );
}

export function OnboardingTermsAcceptanceCard({
  chatConfidential,
  summativeReports,
  documentOwnership,
  onChatConfidentialChange,
  onSummativeReportsChange,
  onDocumentOwnershipChange,
  onAccept,
  loading = false,
  disabled = false,
}: OnboardingTermsAcceptanceCardProps) {
  const allChecked = chatConfidential && summativeReports && documentOwnership;

  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-white px-5 py-5 md:px-6">
      <header className="border-b border-cx-forest-dark/10 pb-4">
        <p className="font-futura-medium text-sm uppercase tracking-wide text-cx-forest-dark">
          Step 1: Complete
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Lock className="h-5 w-5 text-cx-forest-dark" aria-hidden />
          <h2 className="font-futura-medium text-xl text-cx-forest-dark">
            Account Initialization & Privacy Alignment
          </h2>
        </div>
        <p className="font-futura-book mt-3 text-base leading-relaxed text-black">
          Before Coach Mak initializes your profile, please confirm how your data is protected on
          this platform:
        </p>
      </header>

      <div className="mt-4 space-y-3">
        <AcceptanceCheckbox
          id="terms-chat-confidential"
          checked={chatConfidential}
          onChange={onChatConfidentialChange}
        >
          I acknowledge that my Direct Chat text and conversations are 100% confidential and NEVER
          shared with my institution, Program Director, or CCC.
        </AcceptanceCheckbox>

        <AcceptanceCheckbox
          id="terms-summative-reports"
          checked={summativeReports}
          onChange={onSummativeReportsChange}
        >
          I understand that my institution only receives high-level, aggregated summative reports
          for milestone tracking, which are completely masked if my track has fewer than 5 peers.
        </AcceptanceCheckbox>

        <AcceptanceCheckbox
          id="terms-document-ownership"
          checked={documentOwnership}
          onChange={onDocumentOwnershipChange}
        >
          I understand that I own 100% of all generated CVs, portfolios, and academic documents
          permanently.
        </AcceptanceCheckbox>
      </div>

      <p className="font-futura-book mt-5 text-sm leading-relaxed text-black">
        By clicking &ldquo;Accept &amp; Initialize Profile,&rdquo; I agree to the complete{" "}
        <Link
          href="/legal/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="font-futura-medium text-cx-forest-dark underline underline-offset-2"
        >
          FISCMAK Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="font-futura-medium text-cx-forest-dark underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <Button
        type="button"
        className="mt-6 w-full"
        onClick={onAccept}
        disabled={disabled || loading || !allChecked}
      >
        {loading ? "Initializing…" : "Accept & Initialize Profile"}
      </Button>
    </section>
  );
}
