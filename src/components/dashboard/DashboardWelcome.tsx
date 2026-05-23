"use client";

import { timeOfDayGreeting } from "@/lib/mak-greeting";

type DashboardWelcomeProps = {
  displayName: string;
  lastUpdated?: string | null;
};

export function DashboardWelcome({ displayName, lastUpdated }: DashboardWelcomeProps) {
  const salutation = timeOfDayGreeting();

  return (
    <header className="mb-6">
      <p className="text-cx-label uppercase">Dashboard</p>
      <h1 className="text-cx-h1">
        {salutation}, {displayName}.
      </h1>
      <p className="mt-2 text-cx-body">How can Mak help you today?</p>
      {lastUpdated && (
        <p className="mt-1 text-cx-label">Updated {lastUpdated}</p>
      )}
    </header>
  );
}
