import localFont from "next/font/local";

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
});

/** Apply on marketing/landing page root: className={marketingFontVariables} */
export const marketingFontVariables = [
  futuraPtBold.variable,
  futuraCondensedMedium.variable,
  futuraPtBook.variable,
  futuraPtMedium.variable,
].join(" ");
