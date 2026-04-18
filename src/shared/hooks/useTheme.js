"use client";

import { useEffect, useState } from "react";
import useThemeStore from "@/store/themeStore";

function getSystemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  const { theme, setTheme, initTheme } = useThemeStore();
  const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPrefersDark());

  // Initialize and sync when theme or system preference changes
  useEffect(() => {
    initTheme();
  }, [theme, systemPrefersDark, initTheme]);

  // Track system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    setSystemPrefersDark(mediaQuery.matches); // Sync on mount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);

  return {
    theme,
    setTheme,
    isDark,
  };
}
