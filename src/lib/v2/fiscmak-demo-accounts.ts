/**
 * Username-only demo login — maps friendly names to seeded test.fiscmak.local emails.
 * See docs/seeds/fiscmak_demo_accounts.json
 */

import demoPack from "../../../docs/seeds/fiscmak_demo_accounts.json";
import battery from "../../../docs/seeds/test_profile_battery.json";
import { testProfileEmail } from "@/lib/v2/test-profile-battery";

export type FiscmakDemoAccount = {
  username: string;
  battery_username: string;
  label: string;
  hint: string;
};

const EMAIL_DOMAIN = battery.email_domain;

export const FISCMAK_DEMO_ACCOUNTS: FiscmakDemoAccount[] = demoPack.accounts as FiscmakDemoAccount[];

const DEMO_BY_USERNAME = new Map(
  FISCMAK_DEMO_ACCOUNTS.map((account) => [account.username.toLowerCase(), account]),
);

const BATTERY_USERNAMES = new Set(
  battery.profiles.map((profile) => profile.username.toLowerCase()),
);

/** Enabled when demo username login is allowed (staging / team QA). */
export function isDemoLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FISCMAK_DEMO_LOGIN === "true";
}

export function listFiscmakDemoAccounts(): FiscmakDemoAccount[] {
  return FISCMAK_DEMO_ACCOUNTS;
}

/** Resolve a login identifier to the Supabase auth email, or null if not a demo account. */
export function resolveDemoLoginEmail(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  const demoAccount = DEMO_BY_USERNAME.get(lower);
  if (demoAccount) {
    return testProfileEmail(demoAccount.battery_username);
  }

  const batteryKey = trimmed.toUpperCase();
  if (BATTERY_USERNAMES.has(batteryKey.toLowerCase())) {
    return testProfileEmail(batteryKey);
  }

  if (lower.endsWith(`@${EMAIL_DOMAIN}`)) {
    const username = lower.slice(0, -(EMAIL_DOMAIN.length + 1)).toUpperCase();
    if (BATTERY_USERNAMES.has(username.toLowerCase())) {
      return `${username.toLowerCase()}@${EMAIL_DOMAIN}`;
    }
  }

  return null;
}

export function isDemoLoginIdentifier(input: string): boolean {
  return resolveDemoLoginEmail(input) !== null;
}

export function demoAccountForInput(input: string): FiscmakDemoAccount | null {
  const lower = input.trim().toLowerCase();
  return DEMO_BY_USERNAME.get(lower) ?? null;
}

/** Battery usernames to seed when running the 10-account demo pack. */
export function demoPackBatteryUsernames(): string[] {
  return FISCMAK_DEMO_ACCOUNTS.map((account) => account.battery_username);
}
