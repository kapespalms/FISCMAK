/** Static brand PNGs in /public/brands (transparent). Sync from Canva via `npm run brand:sync`. */

/** Default user profile — physician silhouette (not Coach Mak). */
export const DEFAULT_PROFILE_AVATAR_SRC = "/brands/default-profile.png";

/** Coach Mak — green M inside the silent-C ring (chat + marketing). */
export const MAK_AVATAR_SRC = "/brands/logo-cm.png";

export const HERO_CHESS_SRC = "/brands/hero-chess.png";
/** @deprecated Use MAK_AVATAR_SRC */
export const LOGO_CM_SRC = MAK_AVATAR_SRC;

/**
 * Marketing landing — export from Canva board (2× PNG).
 * @see docs/canva-exports/README.md
 */
/** Hero — framed chess queen (Canva). Do not use hero-queen-transparent (low-res glitch export). */
export const LANDING_CHESS_QUEEN_SRC = "/marketing/landing/fiscmak-chess-queen.png";
/** Full FISC · Silent C · MAK name board (Canva). */
export const LANDING_NAME_BREAKDOWN_SRC = "/marketing/landing/fiscmak-name-breakdown.png";

/** @deprecated Glitchy 520px export — use LANDING_CHESS_QUEEN_SRC */
export const LANDING_HERO_QUEEN_SRC = LANDING_CHESS_QUEEN_SRC;
/** @deprecated Use MAK_AVATAR_SRC */
export const LANDING_LOGO_CM_SRC = MAK_AVATAR_SRC;
export const LANDING_CROWN_AVATAR_SRC = "/marketing/landing/fiscmak-crown-avatar.png";
/** @deprecated Tiny frame crops — use LANDING_NAME_BREAKDOWN_SRC instead */
export const LANDING_PANEL_FISC_SRC = "/marketing/landing/panel-fisc.png";
/** @deprecated Tiny frame crops — use LANDING_NAME_BREAKDOWN_SRC instead */
export const LANDING_PANEL_SILENT_C_SRC = "/marketing/landing/panel-silent-c.png";
/** @deprecated Tiny frame crops — use LANDING_NAME_BREAKDOWN_SRC instead */
export const LANDING_PANEL_MAK_SRC = "/marketing/landing/panel-mak.png";

/** @deprecated Legacy Mak silhouette — use MAK_AVATAR_SRC (logo-cm) */
export const LEGACY_MAK_AVATAR_SRC = "/brands/mak-avatar.png";
