/**
 * FISCMAK test profile battery — canonical stage interpretations for QA personas.
 * Source: docs/seeds/test_profile_battery.json
 */

import battery from "../../../docs/seeds/test_profile_battery.json";
import type { CareerLevel } from "@/lib/v2/onboarding-options";

export type TestProfileGroup = "general" | "institutional";

export type TestProfileSpec = {
  username: string;
  group: TestProfileGroup;
  training_level: string;
  formal_label: string;
  career_stage: CareerLevel;
  interpretation: string;
  pgy_level?: string;
  base_specialty?: string;
  subspecialty?: string;
  current_rotation?: string;
};

const EMAIL_DOMAIN = battery.email_domain;

export const TEST_PROFILE_BATTERY: TestProfileSpec[] = battery.profiles as TestProfileSpec[];

export function testProfileEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

export function isTestProfileEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${EMAIL_DOMAIN}`);
}

export function lookupTestProfile(input: {
  email?: string | null;
  username?: string | null;
  test_profile_username?: string | null;
}): TestProfileSpec | null {
  const username =
    input.test_profile_username?.trim().toUpperCase() ??
    input.username?.trim().toUpperCase() ??
    (input.email ? input.email.split("@")[0]?.toUpperCase() : null);
  if (!username) return null;
  return TEST_PROFILE_BATTERY.find((p) => p.username === username) ?? null;
}

export function testProfileMakContext(profile: TestProfileSpec): string {
  const groupLabel = profile.group === "institutional" ? "institution-affiliated" : "general signup";
  return [
    "Test profile battery (QA persona — interpret Mak responses through this lens):",
    `- Username: ${profile.username} · ${groupLabel}`,
    `- Formal label: ${profile.formal_label}`,
    `- Training level: ${profile.training_level} · career stage: ${profile.career_stage}`,
    `- Core system interpretation: ${profile.interpretation}`,
  ].join("\n");
}
