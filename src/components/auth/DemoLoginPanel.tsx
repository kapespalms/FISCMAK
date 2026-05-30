"use client";

import {
  demoAccountForInput,
  isDemoLoginEnabled,
  listFiscmakDemoAccounts,
} from "@/lib/v2/fiscmak-demo-accounts";

type DemoAccountPickerProps = {
  identifier: string;
  onSelect: (username: string) => void;
};

export function DemoAccountPicker({ identifier, onSelect }: DemoAccountPickerProps) {
  if (!isDemoLoginEnabled()) return null;

  const accounts = listFiscmakDemoAccounts();
  const selected = demoAccountForInput(identifier);

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4">
      <p className="font-futura-bold text-sm uppercase tracking-wide text-marketing-accent">
        Demo accounts
      </p>
      <p className="auth-subtle font-futura-medium mt-1 text-sm">
        No email needed — enter <strong className="font-normal text-white">demo1</strong> through{" "}
        <strong className="font-normal text-white">demo10</strong> above with the team password.
      </p>
      {selected ? (
        <p className="auth-muted mt-2 text-xs">
          {selected.label} — {selected.hint}
        </p>
      ) : null}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {accounts.map((account) => (
          <li key={account.username}>
            <button
              type="button"
              onClick={() => onSelect(account.username)}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left transition hover:border-marketing-accent/60 hover:bg-black/30"
            >
              <span className="font-futura-bold text-sm text-white">{account.username}</span>
              <span className="auth-muted mt-0.5 block text-xs">{account.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** @deprecated Use DemoAccountPicker */
export function DemoLoginPanel({
  onSelect,
}: {
  onSignedIn?: () => void;
  onError?: (message: string) => void;
  onSelect?: (username: string) => void;
}) {
  if (!onSelect) return null;
  return <DemoAccountPicker identifier="" onSelect={onSelect} />;
}
