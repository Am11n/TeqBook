"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type { AppLocale } from "@/i18n/translations";
import {
  clampToEnabledLocale,
  getDocumentDirection,
} from "@/i18n/locale-policy";

// Re-export AppLocale as Locale for backward compatibility
export type Locale = AppLocale;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (value: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  children: ReactNode;
};

export function LocaleProvider({ children }: LocaleProviderProps) {
  // Default to "en", will be set by SalonProvider when salon data loads
  const [locale, setLocaleState] = useState<Locale>(clampToEnabledLocale("en"));

  // Memoize setLocale to prevent infinite loops in useEffect dependencies
  const setLocale = useCallback((value: Locale) => {
    setLocaleState(clampToEnabledLocale(value));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDocumentDirection(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}


