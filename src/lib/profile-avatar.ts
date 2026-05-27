import { DEFAULT_PROFILE_AVATAR_SRC } from "@/lib/brand-assets";

const STORAGE_KEY = "fiscmak_profile_avatar";
export const AVATAR_CHANGED_EVENT = "fiscmak-avatar-changed";

export function hasCustomProfileAvatar(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

export function getProfileAvatarUrl(): string {
  if (typeof window === "undefined") return DEFAULT_PROFILE_AVATAR_SRC;
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PROFILE_AVATAR_SRC;
}

export function resolveProfileAvatarUrl(remoteUrl?: string | null): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return local;
  }
  return remoteUrl ?? DEFAULT_PROFILE_AVATAR_SRC;
}

function cacheAvatarUrl(url: string) {
  if (typeof window === "undefined") return;
  if (url === DEFAULT_PROFILE_AVATAR_SRC) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, url);
  }
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT, { detail: url }));
}

export async function fetchProfileAvatarUrl(): Promise<string> {
  try {
    const res = await fetch("/api/v1/profile/avatar");
    if (!res.ok) return getProfileAvatarUrl();
    const data = (await res.json()) as { profile_photo_url?: string | null };
    const url = data.profile_photo_url ?? DEFAULT_PROFILE_AVATAR_SRC;
    cacheAvatarUrl(url);
    return url;
  } catch {
    return getProfileAvatarUrl();
  }
}

export async function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function processAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Image must be under 2 MB.");
  }

  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/v1/profile/avatar", { method: "POST", body: form });

  if (res.ok) {
    const data = (await res.json()) as { profile_photo_url?: string };
    const url = data.profile_photo_url ?? DEFAULT_PROFILE_AVATAR_SRC;
    cacheAvatarUrl(url);
    return url;
  }

  if (res.status === 400 || res.status === 503) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "Could not upload photo.");
  }

  const dataUrl = await readImageFileAsDataUrl(file);
  cacheAvatarUrl(dataUrl);
  return dataUrl;
}

export async function clearProfileAvatar(): Promise<void> {
  try {
    await fetch("/api/v1/profile/avatar", { method: "DELETE" });
  } catch {
    /* offline */
  }
  cacheAvatarUrl(DEFAULT_PROFILE_AVATAR_SRC);
}
