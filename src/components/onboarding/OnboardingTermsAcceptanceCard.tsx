"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ACCEPTANCE_CARD_COPY } from "@/lib/onboarding/acceptance-card-copy";

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
  error?: string;
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
        "group flex cursor-pointer items-start gap-6 rounded-xl border bg-[#FCFBF7] p-6 font-futura-book transition-all",
        checked ? "border-fis-gold/30 bg-fis-gold/5" : "border-cx-forest-dark/15 hover:border-cx-forest-dark/30",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-cx-forest-dark/30 bg-transparent text-fis-gold accent-fis-gold focus:ring-0 focus:ring-offset-0"
      />
      <p className="text-base leading-relaxed text-cx-text/80 transition-colors group-hover:text-cx-text">
        {children}
      </p>
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
  error,
}: OnboardingTermsAcceptanceCardProps) {
  const allChecked = chatConfidential && summativeReports && documentOwnership;

  return (
    <div className="space-y-10 font-futura-book">
      <div className="space-y-6">
        <AcceptanceCheckbox
          id="terms-chat-confidential"
          checked={chatConfidential}
          onChange={onChatConfidentialChange}
        >
          {ACCEPTANCE_CARD_COPY.checkbox1}
        </AcceptanceCheckbox>

        <AcceptanceCheckbox
          id="terms-summative-reports"
          checked={summativeReports}
          onChange={onSummativeReportsChange}
        >
          {ACCEPTANCE_CARD_COPY.checkbox2}
        </AcceptanceCheckbox>

        <AcceptanceCheckbox
          id="terms-document-ownership"
          checked={documentOwnership}
          onChange={onDocumentOwnershipChange}
        >
          {ACCEPTANCE_CARD_COPY.checkbox3}
        </AcceptanceCheckbox>
      </div>

      <p className="text-sm font-medium text-cx-text/60">
        {ACCEPTANCE_CARD_COPY.legalPrefix}{" "}
        <Link
          href="/legal/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cx-text underline underline-offset-4 transition-colors hover:text-fis-gold"
        >
          {ACCEPTANCE_CARD_COPY.termsLabel}
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cx-text underline underline-offset-4 transition-colors hover:text-fis-gold"
        >
          {ACCEPTANCE_CARD_COPY.privacyLabel}
        </Link>
        .
      </p>

      {error ? (
        <p className="rounded-lg border border-[#C28D6C]/30 bg-[#C28D6C]/10 px-4 py-3 text-sm text-[#C28D6C]">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onAccept}
        disabled={disabled || loading || !allChecked}
        className="w-full rounded-xl bg-fis-gold py-4.5 font-futura-bold text-sm uppercase tracking-widest text-white shadow-sm transition-all hover:bg-fis-gold/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? ACCEPTANCE_CARD_COPY.acceptButtonLoading : ACCEPTANCE_CARD_COPY.acceptButton}
      </button>
    </div>
  );
}
