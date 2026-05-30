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
        "group flex cursor-pointer items-start gap-6 rounded-xl border bg-[#0A0C10] p-6 font-futura-book transition-all",
        checked ? "border-[#A3E635]/40" : "border-white/5 hover:border-white/10",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-gray-600 bg-transparent text-[#A3E635] accent-[#A3E635] focus:ring-0 focus:ring-offset-0"
      />
      <p className="text-base leading-relaxed text-gray-300 transition-colors group-hover:text-white">
        {children}
      </p>
    </label>
  );
}

/** Inner acceptance content — carousel header and LuxuryWorkspace shell live in the parent. */
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
          I acknowledge that my Direct Chat text and conversations are{" "}
          <strong className="font-bold text-white">100% confidential</strong> and{" "}
          <strong className="font-semibold text-[#D4AF37]">NEVER shared</strong> with my
          institution, Program Director, or CCC.
        </AcceptanceCheckbox>

        <AcceptanceCheckbox
          id="terms-summative-reports"
          checked={summativeReports}
          onChange={onSummativeReportsChange}
        >
          I understand that my institution only receives high-level, aggregated summative reports
          for milestone tracking, which are{" "}
          <strong className="font-bold text-white">completely masked</strong> if my track has
          fewer than 5 peers.
        </AcceptanceCheckbox>

        <AcceptanceCheckbox
          id="terms-document-ownership"
          checked={documentOwnership}
          onChange={onDocumentOwnershipChange}
        >
          I understand that{" "}
          <strong className="font-semibold text-[#A3E635]">I own 100%</strong> of all generated
          CVs, portfolios, and academic documents permanently.
        </AcceptanceCheckbox>
      </div>

      <p className="text-xs font-medium text-gray-500">
        {ACCEPTANCE_CARD_COPY.legalPrefix}{" "}
        <Link
          href="/legal/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-4 transition-colors hover:text-[#D4AF37]"
        >
          {ACCEPTANCE_CARD_COPY.termsLabel}
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-4 transition-colors hover:text-[#D4AF37]"
        >
          {ACCEPTANCE_CARD_COPY.privacyLabel}
        </Link>
        .
      </p>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onAccept}
        disabled={disabled || loading || !allChecked}
        className="w-full rounded-xl bg-[#D4AF37] py-4.5 font-futura-bold text-sm uppercase tracking-widest text-[#0A0C10] shadow-[0_4px_20px_rgba(212,175,55,0.15)] transition-all hover:bg-[#c29f2e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? ACCEPTANCE_CARD_COPY.acceptButtonLoading : ACCEPTANCE_CARD_COPY.acceptButton}
      </button>
    </div>
  );
}
