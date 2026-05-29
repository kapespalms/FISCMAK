/**
 * UH psych rotation drive file links — repo paths vs external Google Drive/Docs.
 */

export type DriveFileLink = {
  label: string;
  url: string;
  isExternal: boolean;
};

const EXTERNAL_HOSTS = ["drive.google.com", "docs.google.com"];

export function isExternalDriveUrl(url: string): boolean {
  if (url.startsWith("/content/")) return false;
  try {
    const host = new URL(url).hostname;
    return EXTERNAL_HOSTS.some((h) => host.includes(h));
  } catch {
    return !url.startsWith("/");
  }
}

export function resolveDriveFileLink(file: { label: string; url: string }): DriveFileLink {
  return {
    label: file.label,
    url: file.url,
    isExternal: isExternalDriveUrl(file.url),
  };
}

export function mergeDriveFileLists(
  ...lists: Array<Array<{ label: string; url: string }> | undefined>
): DriveFileLink[] {
  const seen = new Set<string>();
  const out: DriveFileLink[] = [];
  for (const list of lists) {
    if (!list) continue;
    for (const file of list) {
      if (!file.url || seen.has(file.url)) continue;
      seen.add(file.url);
      out.push(resolveDriveFileLink(file));
    }
  }
  return out;
}
