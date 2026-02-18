"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DialogSelect } from "@/components/ui/dialog-select";
import type { Locale } from "./landing-copy";

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
            <DialogSelect
              value={locale}
              onChange={(v) => setLocale(v as Locale)}
              options={[
                { value: "nb", label: "Norsk" },
                { value: "en", label: "English" },
                { value: "ar", label: "العربية" },
                { value: "so", label: "Soomaali" },
                { value: "ti", label: "ትግርኛ" },
                { value: "am", label: "አማርኛ" },
                { value: "tr", label: "Türkçe" },
                { value: "pl", label: "Polski" },
                { value: "vi", label: "Tiếng Việt" },
                { value: "tl", label: "Tagalog" },
                { value: "zh", label: "中文" },
                { value: "fa", label: "فارسی" },
                { value: "dar", label: "دری" },
                { value: "ur", label: "اردو" },
                { value: "hi", label: "हिन्दी" },
              ]}
            />
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

