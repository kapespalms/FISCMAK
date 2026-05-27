import type { Metadata } from "next";
import { redirect } from "next/navigation";

/** Legacy URL — canonical join page is /join/uh/psychiatry */
export default function JoinUhPsychiatryLegacyPage() {
  redirect("/join/uh/psychiatry");
}

export const metadata: Metadata = {
  title: "Join UH Psychiatry Residency — FISCMAK",
};
