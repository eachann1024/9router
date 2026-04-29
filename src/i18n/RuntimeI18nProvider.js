"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { initRuntimeI18n, reloadTranslations, onLocaleChange } from "./runtime";

export function RuntimeI18nProvider({ children }) {
  const pathname = usePathname();
  const [, setTick] = useState(0);

  useEffect(() => {
    initRuntimeI18n();

    const unsubscribe = onLocaleChange(() => {
      setTick((t) => t + 1);
    });

    return unsubscribe;
  }, []);

  // Re-process DOM when route changes
  useEffect(() => {
    if (pathname) {
      // Double RAF to ensure React has committed changes to DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          reloadTranslations();
        });
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
