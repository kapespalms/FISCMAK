export const PERSONAL_EVENT_COLOR = "#A5B4FC";

/** Distinct default colors per UH psych rotation code (hex — user-overridable). */
export const DEFAULT_ROTATION_COLORS: Record<string, string> = {
  va_ct6: "#C4B5FD",
  uh_concord: "#A78BFA",
  swg: "#8B5CF6",
  northcoast: "#7C3AED",
  capu: "#DDD6FE",
  psych_ed_uh: "#F0ABFC",
  psych_ed_uh_va: "#E879F9",
  cl: "#FCD34D",
  mpu_cl: "#FBBF24",
  child_cl: "#F59E0B",
  outpatient_adult: "#7DD3FC",
  outpatient_child: "#38BDF8",
  outpatient_addiction: "#0EA5E9",
  va_addiction: "#0284C7",
  mat_addiction: "#0369A1",
  access_clinic: "#A5F3FC",
  psychotherapy_clinic: "#67E8F9",
  geriatric_psychiatry: "#22D3EE",
  uh_interventional: "#06B6D4",
  neurology: "#86EFAC",
  va_im: "#4ADE80",
  va_ed_im: "#22C55E",
  uh_ed: "#16A34A",
  uh_im: "#15803D",
  pediatrics: "#BBF7D0",
  peds_ed: "#6EE7B7",
  medtox: "#34D399",
  elective: "#6EE7B7",
  qi: "#A7F3D0",
  vacation: "#E5E7EB",
  extra_duty: "#D1D5DB",
  call: "#FCA5A5",
  nf: "#F87171",
};

const FALLBACK_PALETTE = [
  "#C4B5FD",
  "#7DD3FC",
  "#FCD34D",
  "#86EFAC",
  "#FCA5A5",
  "#F0ABFC",
  "#67E8F9",
  "#BBF7D0",
];

function hashCode(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h << 5) - h + value.charCodeAt(i);
  return Math.abs(h);
}

export function defaultRotationColor(code: string): string {
  if (code.startsWith("personal:")) return PERSONAL_EVENT_COLOR;
  if (DEFAULT_ROTATION_COLORS[code]) return DEFAULT_ROTATION_COLORS[code];
  return FALLBACK_PALETTE[hashCode(code) % FALLBACK_PALETTE.length];
}

export function resolveRotationColors(
  codes: string[],
  overrides: Record<string, string> = {},
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const code of codes) {
    const override = overrides[code]?.trim();
    map[code] = override && /^#[0-9A-Fa-f]{6}$/.test(override) ? override : defaultRotationColor(code);
  }
  return map;
}

export function textColorForBackground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111111" : "#FFFFFF";
}
