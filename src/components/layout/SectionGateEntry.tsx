"use client";

import { useEffect, useRef } from "react";
import { useAppShell } from "@/components/layout/AppShell";
import type { MakFlowIntent } from "@/lib/mak-sections";
import { buildSectionGateGreeting } from "@/lib/mak-chatbot-states";

/** Triggers chatbot gate entry once when a SOAPO workspace mounts */
export function SectionGateEntry({
  intent,
  customGreeting,
}: {
  intent: MakFlowIntent;
  customGreeting?: string;
}) {
  const { startMakFlow, displayName } = useAppShell();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const greeting =
      customGreeting ??
      buildSectionGateGreeting({ section: intentToSection(intent), displayName });
    startMakFlow(intent, undefined, greeting);
  }, [intent, customGreeting, displayName, startMakFlow]);

  return null;
}

function intentToSection(intent: MakFlowIntent) {
  switch (intent) {
    case "discuss":
      return "subjective" as const;
    case "review":
      return "objective" as const;
    case "assess":
      return "assessment" as const;
    case "plan":
      return "plan" as const;
    case "create":
      return "output" as const;
    default:
      return "dashboard" as const;
  }
}
