/** Static brand PNGs in /public/brands (transparent). Sync from Canva via `npm run brand:sync`. */

/** Default user profile — physician silhouette (not Coach Mak). */
export const DEFAULT_PROFILE_AVATAR_SRC = "/brands/default-profile.png";

/** Coach Mak — green M inside the silent-C ring (chat + marketing). */
export const MAK_AVATAR_SRC = "/brands/logo-cm.png";

export const HERO_CHESS_SRC = "/brands/hero-chess.png";
/** @deprecated Use MAK_AVATAR_SRC */
export const LOGO_CM_SRC = MAK_AVATAR_SRC;

/**
 * Marketing landing — derived from Canva board exports.
 * @see docs/canva-exports/README.md
 */
/** @deprecated Glitchy auto-crop — use LANDING_PANEL_SILENT_C_SRC in hero */
export const LANDING_HERO_KING_SRC = "/marketing/landing/hero-king-focus.png";
/** Name pillar framed art — HD crops from Canva board. */
export const LANDING_PANEL_FISC_SRC = "/marketing/landing/panel-fisc-hd.png";
export const LANDING_PANEL_SILENT_C_SRC = "/marketing/landing/panel-silent-c-hd.png";
export const LANDING_PANEL_MAK_SRC = "/marketing/landing/panel-mak-hd.png";
/** Hero — full Silent C pillar frame (matches meaning section). */
export const LANDING_HERO_ART_SRC = LANDING_PANEL_SILENT_C_SRC;

/** Full Canva board — reference only; do not embed on dark landing (white background). */
export const LANDING_NAME_BREAKDOWN_SRC = "/marketing/landing/fiscmak-name-breakdown.png";
/** Full framed queen export — reference only. */
export const LANDING_CHESS_QUEEN_SRC = "/marketing/landing/fiscmak-chess-queen.png";

/** @deprecated Glitchy 520px export — use LANDING_HERO_KING_SRC */
export const LANDING_HERO_QUEEN_SRC = LANDING_HERO_KING_SRC;
/** @deprecated Use MAK_AVATAR_SRC */
export const LANDING_LOGO_CM_SRC = MAK_AVATAR_SRC;
export const LANDING_CROWN_AVATAR_SRC = "/marketing/landing/fiscmak-crown-avatar.png";

/** @deprecated Legacy Mak silhouette — use MAK_AVATAR_SRC (logo-cm) */
export const LEGACY_MAK_AVATAR_SRC = "/brands/mak-avatar.png";
