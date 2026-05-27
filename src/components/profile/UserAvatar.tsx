"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_PROFILE_AVATAR_SRC } from "@/lib/brand-assets";

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-lg",
} as const;

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function UserAvatar({ src, name, size = "sm", className }: UserAvatarProps) {
  const initials = initialsFromName(name);
  const imageSrc = src ?? DEFAULT_PROFILE_AVATAR_SRC;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cx-forest-dark/10 font-semibold text-cx-forest-dark ring-1 ring-cx-forest-dark/15",
        SIZE[size],
        className,
      )}
    >
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
      ) : initials ? (
        <span aria-hidden>{initials}</span>
      ) : (
        <User size={size === "lg" ? 28 : size === "md" ? 20 : 18} aria-hidden />
      )}
    </span>
  );
}
