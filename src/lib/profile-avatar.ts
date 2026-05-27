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

export function setProfileAvatarUrl(dataUrl: string) {
  localStorage.setItem(STORAGE_KEY, dataUrl);
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT, { detail: dataUrl }));
}

export function clearProfileAvatarUrl() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent(AVATAR_CHANGED_EVENT, { detail: DEFAULT_PROFILE_AVATAR_SRC }),
  );
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
  const dataUrl = await readImageFileAsDataUrl(file);
  setProfileAvatarUrl(dataUrl);
  return dataUrl;
}
