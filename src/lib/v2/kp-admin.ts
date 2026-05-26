/** KP-only admin surfaces — visible only to founder accounts. */

import type { NextResponse } from "next/server";
import { isErrorResponse, jsonError, requireApiUser } from "@/lib/v2/api-helpers";

const DEFAULT_KP_ADMIN_EMAILS = [
  "kristenpalmermd@gmail.com",
  "fiscmak@outlook.com",
] as const;

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function getKpAdminEmails(): readonly string[] {
  const fromEnv = process.env.KP_ADMIN_EMAILS?.split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : DEFAULT_KP_ADMIN_EMAILS;
}

export function isKpAdminEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return getKpAdminEmails().includes(normalized);
}

/** Gate KP-admin-only API routes (founder email allowlist). */
export async function requireKpAdminApiUser(): Promise<
  { userId: string; email: string; demo: boolean } | NextResponse
> {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (!isKpAdminEmail(auth.email)) {
    return jsonError("forbidden", "KP admin access only.", 403);
  }
  return auth;
}
