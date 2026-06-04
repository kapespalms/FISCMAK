import { Jost } from "next/font/google";

// Jost — free geometric Futura revival (SIL OFL). CSS variable names kept
// unchanged so all existing globals.css font-family declarations continue to work.

export const jostBook = Jost({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-futura-pt-book",
  display: "swap",
  fallback: ["Jost", "Helvetica Neue", "Arial", "sans-serif"],
});

export const jostMedium = Jost({
  subsets: ["latin"],
  weight: "500",
  style: ["normal", "italic"],
  variable: "--font-futura-pt-medium",
  display: "swap",
  fallback: ["Jost", "Helvetica Neue", "Arial", "sans-serif"],
});

export const jostBold = Jost({
  subsets: ["latin"],
  weight: "700",
  style: ["normal", "italic"],
  variable: "--font-futura-pt-bold",
  display: "swap",
  fallback: ["Jost", "Helvetica Neue", "Arial", "sans-serif"],
});

export const jostCondensed = Jost({
  subsets: ["latin"],
  weight: "500",
  style: ["normal"],
  variable: "--font-futura-condensed-medium",
  display: "swap",
  fallback: ["Jost", "Helvetica Neue", "Arial", "sans-serif"],
});

// Legacy named exports — still referenced by layout.tsx
export const futuraPtBook    = jostBook;
export const futuraPtMedium  = jostMedium;
export const futuraPtBold    = jostBold;
export const futuraCondensedMedium = jostCondensed;

/** CSS variable classes — apply on <html> once. */
export const siteFontVariables = [
  jostBook.variable,
  jostMedium.variable,
  jostBold.variable,
  jostCondensed.variable,
].join(" ");

/** @deprecated Use siteFontVariables */
export const marketingFontVariables = siteFontVariables;

/** Default body face (Book 400) — apply on <body>. */
export const siteBodyFont = jostBook;
