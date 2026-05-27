"use client";

import { useEffect } from "react";
import { applyTheme, getPreferredTheme } from "@/lib/theme-preference";

/** Applies saved theme on mount and keeps `dark` class in sync. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  return children;
}
