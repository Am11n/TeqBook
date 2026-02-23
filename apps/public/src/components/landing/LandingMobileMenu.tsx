"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "./landing-copy";
import { LANGUAGE_FLAGS, LANGUAGE_LABELS, type LanguageCode } from "./language-constants";

interface LandingMobileMenuProps {
  open: boolean;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  onClose: () => void;
  brand: string;
  signUpButton: string;
  logInButton: string;
}

export function LandingMobileMenu({
  open,
  locale,
  setLocale,
  onClose,
  brand,
  signUpButton,
  logInButton,
}: LandingMobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden">
      {/* Clickable backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />

      {/* Sliding panel */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col gap-6 border-r bg-white px-5 py-6 shadow-xl"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Image
              src="/Favikon.svg"
              alt={brand}
              width={120}
              height={32}
              className="h-8 w-auto"
              loading="lazy"
              fetchPriority="low"
            />
            <span className="text-sm font-semibold tracking-tight text-slate-900">
              {brand}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close menu"
          >
            <span className="relative block h-5 w-5">
              <span className="absolute top-1/2 left-1/2 block h-0.5 w-4 rotate-45 rounded bg-slate-700 -translate-x-1/2 -translate-y-1/2" />
              <span className="absolute top-1/2 left-1/2 block h-0.5 w-4 -rotate-45 rounded bg-slate-700 -translate-x-1/2 -translate-y-1/2" />
            </span>
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Language selector — flag grid */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              {locale === "nb" ? "Språk" : "Language"}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(LANGUAGE_FLAGS) as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLocale(lang as Locale);
                    onClose();
                  }}
                  className={`flex flex-col items-center gap-0.5 rounded-lg p-2 text-center transition-colors ${
                    locale === lang
                      ? "bg-blue-50 ring-1 ring-blue-300"
                      : "hover:bg-slate-100"
                  }`}
                  title={LANGUAGE_LABELS[lang]}
                >
                  <span className="text-lg leading-none">{LANGUAGE_FLAGS[lang]}</span>
                  <span className="text-[10px] text-slate-500">{lang.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <Link href="/signup" onClick={onClose}>
              <Button className="w-full" size="sm">
                {signUpButton}
              </Button>
            </Link>
            <Link href="/login" onClick={onClose}>
              <Button variant="outline" className="w-full" size="sm">
                {logInButton}
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

