"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Home, Settings, User } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useAppShell } from "@/components/layout/AppShell";
import { UserAvatar } from "@/components/profile/UserAvatar";
import {
  AVATAR_CHANGED_EVENT,
  fetchProfileAvatarUrl,
  getProfileAvatarUrl,
  processAvatarFile,
} from "@/lib/profile-avatar";

export function ProfileMenu() {
  const { displayName } = useAppShell();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchProfileAvatarUrl().then(setAvatarUrl);
    function onAvatarChange(e: Event) {
      const detail = (e as CustomEvent<string | null>).detail;
      setAvatarUrl(detail ?? getProfileAvatarUrl());
    }
    window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      await processAvatarFile(file);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update photo.");
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <UserAvatar src={avatarUrl} name={displayName} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-0 left-full ml-2 z-50 min-w-[200px] overflow-hidden rounded-xl border border-cx-forest-dark/15 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-cx-forest-dark/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-cx-text">
              {displayName ?? "Your account"}
            </p>
            {error && <p className="mt-1 text-xs text-cx-attention">{error}</p>}
          </div>
          <Link
            href="/app/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-text transition-colors hover:bg-cx-forest-dark/5"
          >
            <User size={16} className="text-cx-text/60" />
            Profile
          </Link>
          <Link
            href="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-text transition-colors hover:bg-cx-forest-dark/5"
          >
            <Settings size={16} className="text-cx-text/60" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-text transition-colors hover:bg-cx-forest-dark/5"
          >
            <Camera size={16} className="text-cx-text/60" />
            Change photo
          </button>
          <Link
            href="/"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-text transition-colors hover:bg-cx-forest-dark/5"
          >
            <Home size={16} className="text-cx-text/60" />
            Back to home
            <span className="sr-only"> (stays signed in)</span>
          </Link>
          <SignOutButton />
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        onChange={(e) => void handleFileChange(e)}
      />
    </div>
  );
}
