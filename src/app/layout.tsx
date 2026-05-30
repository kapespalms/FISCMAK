import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { siteBodyFont, siteFontVariables } from "@/lib/fonts/marketing-fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FISCMAK — Understand your career",
  description:
    "Career intelligence for physicians: capture evidence, map your lattice, generate outputs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", siteFontVariables)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fiscmak_theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={cn("min-h-full flex flex-col antialiased", siteBodyFont.className)}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
