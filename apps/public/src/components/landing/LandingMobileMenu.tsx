"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Locale } from "./landing-copy";

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
              priority
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
          {/* Language selector */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">
              {locale === "nb" ? "Språk" : "Language"}
            </label>
            <select
              value={locale}
              onChange={(e) => {
                setLocale(e.target.value as Locale);
                onClose();
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="nb">🇳🇴 Norsk</option>
              <option value="en">🇬🇧 English</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="so">🇸🇴 Soomaali</option>
              <option value="ti">🇪🇷 ትግርኛ</option>
              <option value="am">🇪🇹 አማርኛ</option>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="pl">🇵🇱 Polski</option>
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="tl">🇵🇭 Tagalog</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="fa">🇮🇷 فارسی</option>
              <option value="dar">🇦🇫 دری</option>
              <option value="ur">🇵🇰 اردو</option>
              <option value="hi">🇮🇳 हिन्दी</option>
            </select>
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

