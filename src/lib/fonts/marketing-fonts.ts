import localFont from "next/font/local";

/** Site-wide Futura PT from src/assets/fonts/futura — do not swap for system or serif stacks. */

export const futuraPtBold = localFont({
  src: [
    {
      path: "../../assets/fonts/futura/futura-pt-bold-589e44b6aacd3.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../assets/fonts/futura/futura-pt-bold-oblique-589e453384a18.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-futura-pt-bold",
  display: "swap",
  fallback: ["Futura PT", "Helvetica Neue", "Arial", "sans-serif"],
});

export const futuraCondensedMedium = localFont({
  src: [
    {
      path: "../../assets/fonts/futura/futura-condensed-pt-medium-589e44ed1e3a5.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/futura/futura-condensed-pt-medium-oblique-589e4507d391c.otf",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-futura-condensed-medium",
  display: "swap",
  fallback: ["Futura PT", "Helvetica Neue", "Arial", "sans-serif"],
});

export const futuraPtBook = localFont({
  src: [
    {
      path: "../../assets/fonts/futura/futura-pt-book-589a6dec272c3.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/futura/futura-pt-book-oblique-589e44623c7b4.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-futura-pt-book",
  display: "swap",
  fallback: ["Futura PT", "Helvetica Neue", "Arial", "sans-serif"],
});

export const futuraPtMedium = localFont({
  src: [
    {
      path: "../../assets/fonts/futura/futura-pt-medium-589e45b956de4.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/futura/futura-pt-medium-oblique-589e460871ec2.otf",
      weight: "500",
      style: "italic",
    },
  ],
  variable: "--font-futura-pt-medium",
  display: "swap",
  fallback: ["Futura PT", "Helvetica Neue", "Arial", "sans-serif"],
});

/** CSS variable classes — apply on <html> once. */
export const siteFontVariables = [
  futuraPtBold.variable,
  futuraPtBook.variable,
  futuraPtMedium.variable,
  futuraCondensedMedium.variable,
].join(" ");

/** @deprecated Use siteFontVariables */
export const marketingFontVariables = siteFontVariables;

/** Default body face (Book 400) — apply on <body> so the app always loads hosted Futura. */
export const siteBodyFont = futuraPtBook;
