"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "@/components/locale-provider";
import { LANGUAGE_FLAGS, LANGUAGE_LABELS, type LanguageCode } from "@/components/landing/language-constants";

const LANDING_LOCALE_KEY = "teqbook_landing_locale";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, close]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANDING_LOCALE_KEY);
      if (stored && stored in LANGUAGE_FLAGS) {
        setLocale(stored as LanguageCode);
      }
    } catch { /* ignore */ }
  }, [setLocale]);

  function handleSelect(lang: LanguageCode) {
    setLocale(lang);
    try { localStorage.setItem(LANDING_LOCALE_KEY, lang); } catch { /* ignore */ }
    close();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/60 backdrop-blur-lg outline-none transition-all hover:scale-105 hover:bg-slate-100/60 focus-visible:ring-2 focus-visible:ring-blue-400/30"
        aria-label="Language"
      >
        <span className="text-base leading-none">
          {LANGUAGE_FLAGS[locale as LanguageCode] || "\u{1F310}"}
        </span>
      </button>

      {open && (
        <ul className="absolute right-0 top-full z-30 mt-1 min-w-40 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {(Object.keys(LANGUAGE_FLAGS) as LanguageCode[]).map((lang) => (
            <li key={lang}>
              <button
                type="button"
                onClick={() => handleSelect(lang)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-slate-50"
              >
                <span>{LANGUAGE_FLAGS[lang]}</span>
                <span>{LANGUAGE_LABELS[lang]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
