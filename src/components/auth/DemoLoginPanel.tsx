"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MarketingAuthInput } from "@/components/auth/MarketingAuthInput";
import {
  demoAccountForInput,
  isDemoLoginEnabled,
  listFiscmakDemoAccounts,
  resolveDemoLoginEmail,
} from "@/lib/v2/fiscmak-demo-accounts";

type DemoLoginPanelProps = {
  onSignedIn: () => void;
  onError: (message: string) => void;
};

export function DemoLoginPanel({ onSignedIn, onError }: DemoLoginPanelProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!isDemoLoginEnabled()) return null;

  const accounts = listFiscmakDemoAccounts();
  const selected = demoAccountForInput(username);

  async function signInAs(demoUsername: string) {
    setUsername(demoUsername);
    if (!password.trim()) {
      onError("Enter the team demo password below, then pick an account.");
      return;
    }
    await submitLogin(demoUsername, password);
  }

  async function submitLogin(loginUsername: string, loginPassword: string) {
    const authEmail = resolveDemoLoginEmail(loginUsername);
    if (!authEmail) {
      onError("Unknown demo username. Use demo1 through demo10.");
      return;
    }

    setLoading(true);
    onError("");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: loginPassword,
    });

    if (error) {
      onError(
        error.message.includes("Invalid login credentials")
          ? "Invalid demo password, or this demo account has not been seeded yet."
          : error.message,
      );
      setLoading(false);
      return;
    }

    if (!data.session) {
      onError("Sign-in did not create a session.");
      setLoading(false);
      return;
    }

    onSignedIn();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitLogin(username, password);
  }

  return (
    <section className="mt-8 rounded-2xl border border-white/15 bg-white/5 px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-futura-bold text-sm uppercase tracking-wide text-marketing-accent">
            Demo access
          </p>
          <p className="font-futura-medium mt-1 text-sm text-gray-300">
            No email required — use a demo username and team password.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="font-futura-medium shrink-0 text-xs text-gray-400 transition hover:text-white"
        >
          {expanded ? "Hide list" : "Show accounts"}
        </button>
      </div>

      {expanded ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {accounts.map((account) => (
            <li key={account.username}>
              <button
                type="button"
                disabled={loading}
                onClick={() => void signInAs(account.username)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-left transition hover:border-marketing-accent/60 hover:bg-black/30 disabled:opacity-60"
              >
                <span className="font-futura-bold text-sm text-white">{account.username}</span>
                <span className="mt-0.5 block text-xs text-gray-400">{account.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
        <MarketingAuthInput
          label="Demo username"
          id="demo-username"
          type="text"
          required
          autoComplete="username"
          placeholder="demo1"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
        {selected ? (
          <p className="text-xs text-gray-400">
            {selected.label} — {selected.hint}
          </p>
        ) : null}
        <MarketingAuthInput
          label="Demo password"
          id="demo-password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="font-futura-bold w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in as demo"}
        </button>
      </form>
    </section>
  );
}
