import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  PRIVACY_POLICY_LAST_UPDATED,
  PRIVACY_POLICY_SECTIONS,
} from "@/lib/legal/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy — FISCMAK",
  description: "How FISCMAK handles confidential chat, institutional reporting, and your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );
}
