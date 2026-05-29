import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  FISCMAK_TERMS_LAST_UPDATED,
  TERMS_OF_SERVICE_SECTIONS,
} from "@/lib/legal/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service — FISCMAK",
  description: "FISCMAK Terms and Conditions governing use of the platform and onboarding flow.",
};

export default function TermsOfServicePage() {
  return (
    <LegalDocumentPage
      title="Terms & Conditions"
      lastUpdated={FISCMAK_TERMS_LAST_UPDATED}
      sections={TERMS_OF_SERVICE_SECTIONS}
    />
  );
}
