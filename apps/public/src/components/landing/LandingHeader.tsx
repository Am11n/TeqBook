"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "./landing-copy";
import { LANGUAGE_FLAGS, LANGUAGE_LABELS, type LanguageCode } from "./language-constants";

interface LandingHeaderProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  scrolled: boolean;
  isMobile: boolean;
  logoScale: number;
  logoTextSize: number;
  headerHeight: string;
  brand: string;
  signUpButton: string;
  logInButton: string;
  onMobileMenuOpen: () => void;
}

function LanguageDropdown({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/60 backdrop-blur-lg outline-none transition-all hover:scale-105 hover:bg-slate-100/60 focus-visible:ring-2 focus-visible:ring-blue-400/30"
        aria-label="Language"
        title="Language"
      >
        <span className="text-base leading-none">
          {LANGUAGE_FLAGS[locale as LanguageCode] || "\u{1F310}"}
        </span>
      </button>

      {open && (
        <ul className="absolute right-0 top-full z-30 mt-1 min-w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {(Object.keys(LANGUAGE_FLAGS) as LanguageCode[]).map((lang) => (
            <li key={lang}>
              <button
                type="button"
                onClick={() => {
                  setLocale(lang as Locale);
                  close();
                }}
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

export function LandingHeader({
  locale,
  setLocale,
  scrolled,
  isMobile,
  logoScale,
  logoTextSize,
  headerHeight,
  brand,
  signUpButton,
  logInButton,
  onMobileMenuOpen,
}: LandingHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-20 transition-all duration-300 ${
        scrolled
          ? "border-b border-blue-200/50 bg-white/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent backdrop-blur-none backdrop-saturate-100"
      }`}
    >
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between pl-4 pr-4 transition-all duration-300 sm:px-6 ${headerHeight}`}
      >
        <motion.div
          className="flex items-center gap-0.5 sm:gap-0.5 md:gap-0.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          animate={{
            scale: isMobile ? 1 : logoScale,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Image
            src="/Favikon.svg"
            alt={brand}
            width={150}
            height={40}
            className="h-11 w-auto sm:h-13 flex-shrink-0"
            loading="lazy"
            fetchPriority="low"
          />
          <span
            className="font-semibold tracking-tight transition-all duration-300 text-sm sm:text-base truncate"
            style={{
              fontSize: isMobile ? "0.875rem" : `${logoTextSize}rem`,
            }}
          >
            {brand}
          </span>
        </motion.div>
        <div className="flex items-center gap-2">
          {/* Desktop: Language selector and buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <LanguageDropdown locale={locale} setLocale={setLocale} />
            <Link href="/signup">
              <Button size="sm">{signUpButton}</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                {logInButton}
              </Button>
            </Link>
          </div>

          {/* Mobile: Hamburger menu button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg sm:hidden"
            onClick={onMobileMenuOpen}
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 rounded bg-current" />
              <span className="block h-0.5 w-5 rounded bg-current" />
              <span className="block h-0.5 w-5 rounded bg-current" />
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
