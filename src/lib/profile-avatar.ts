const STORAGE_KEY = "fiscmak_profile_avatar";
export const AVATAR_CHANGED_EVENT = "fiscmak-avatar-changed";

export function getProfileAvatarUrl(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setProfileAvatarUrl(dataUrl: string) {
  localStorage.setItem(STORAGE_KEY, dataUrl);
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT, { detail: dataUrl }));
}

export function clearProfileAvatarUrl() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGED_EVENT, { detail: null }));
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
