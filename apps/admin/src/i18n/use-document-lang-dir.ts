"use client";

import { useEffect } from "react";
import type { AppLocale } from "@/i18n/app-locale";
import { isRtlLocale } from "@/i18n/rtl-locales";

/**
 * Syncs <html lang> and dir with the active admin locale (after mount).
 */
export function useDocumentLangDir(locale: AppLocale): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr";
  }, [locale]);
}
