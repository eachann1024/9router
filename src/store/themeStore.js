"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_CONFIG } from "@/shared/constants/config";

const THEME_COLOR = {
  light: "#FBF9F6",
  dark: "#191918",
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: THEME_CONFIG.defaultTheme,

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initTheme: () => {
        const theme = get().theme;
        applyTheme(theme);
      },
    }),
    {
      name: THEME_CONFIG.storageKey,
    }
  )
);

// Apply theme to document
export function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function syncThemeColorMeta(theme) {
  const existingMeta = document.querySelector('meta[name="theme-color"]');
  const meta =
    existingMeta ||
    Object.assign(document.createElement("meta"), { name: "theme-color" });

  meta.setAttribute("content", THEME_COLOR[theme]);

  if (!existingMeta) {
    document.head.appendChild(meta);
  }
}

export function applyTheme(theme) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;

  root.classList.toggle("dark", effectiveTheme === "dark");
  root.style.colorScheme = effectiveTheme;
  syncThemeColorMeta(effectiveTheme);
}

export default useThemeStore;
