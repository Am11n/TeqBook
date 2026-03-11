"use client";

import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@teqbook/ui";
import type { AppLocale } from "@/i18n/translations";
import type { BookingMode, PublicBookingTokens } from "./types";

const LANG_LABELS: Record<AppLocale, string> = {
  nb: "Norsk",
  en: "English",
  ar: "العربية",
  so: "Soomaali",
  ti: "ትግርኛ",
  am: "አማርኛ",
  tr: "Türkçe",
  pl: "Polski",
  vi: "Tiếng Việt",
  tl: "Tagalog",
  zh: "中文",
  fa: "فارسی",
  dar: "دری (Dari)",
  ur: "اردو",
  hi: "हिन्दी",
};

const LANG_FLAGS: Record<AppLocale, string> = {
  nb: "🇳🇴",
  en: "🇬🇧",
  ar: "🇸🇦",
  so: "🇸🇴",
  ti: "🇪🇷",
  am: "🇪🇹",
  tr: "🇹🇷",
  pl: "🇵🇱",
  vi: "🇻🇳",
  tl: "🇵🇭",
  zh: "🇨🇳",
  fa: "🇮🇷",
  dar: "🇦🇫",
  ur: "🇵🇰",
  hi: "🇮🇳",
};

type HeaderStyle = "compact" | "standard" | "branded";

const DEFAULT_SUBTITLE = "Book your appointment online";

type PublicBookingHeaderProps = {
  salonId: string;
  salonName: string;
  subtitle?: string | null;
  logoUrl?: string | null;
  locale: AppLocale;
  supportedLocales: AppLocale[];
  mode: BookingMode;
  onModeChange: (mode: BookingMode) => void;
  onLocaleChange: (locale: AppLocale) => void;
  tokens: PublicBookingTokens;
  headerStyle: HeaderStyle;
  modeBookTimeLabel: string;
  modeWaitlistLabel: string;
  modeSelectorLabel: string;
  payInSalonBadge: string;
  whatsappNumber?: string | null;
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "T";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
}

export function PublicBookingHeader({
  salonId,
  salonName,
  subtitle,
  logoUrl,
  locale,
  supportedLocales,
  mode,
  onModeChange,
  onLocaleChange,
  tokens,
  headerStyle,
  modeBookTimeLabel,
  modeWaitlistLabel,
  modeSelectorLabel,
  payInSalonBadge,
  whatsappNumber,
}: PublicBookingHeaderProps) {
  const [logoBroken, setLogoBroken] = useState(false);
  const currentLocale = supportedLocales.includes(locale) ? locale : (supportedLocales[0] ?? "en");
  const safeSubtitle = subtitle?.trim() || DEFAULT_SUBTITLE;
  const initials = useMemo(() => getInitials(salonName), [salonName]);
  const logoVisible = Boolean(logoUrl) && !logoBroken;

  return (
    <header
      className="w-full"
      style={{
        background: "transparent",
      }}
    >
      <div
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-4"
        style={{
          minHeight: `var(--pb-header-min-height-${headerStyle})`,
        }}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2.5 sm:gap-4">
          <div
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--pb-radius-md)] border"
            style={{
              width: "calc(var(--pb-header-logo-size) + 0.75rem)",
              height: "calc(var(--pb-header-logo-size) + 0.75rem)",
              borderColor: "var(--pb-border)",
              backgroundColor: "var(--pb-surface)",
            }}
          >
            {logoVisible ? (
              <img
                src={logoUrl || "/Favikon.svg"}
                alt={salonName}
                loading="lazy"
                decoding="async"
                className="h-[var(--pb-header-logo-size)] w-[var(--pb-header-logo-size)] object-contain"
                onError={() => setLogoBroken(true)}
              />
            ) : (
              <span
                className="inline-flex h-[var(--pb-header-logo-size)] w-[var(--pb-header-logo-size)] items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--pb-primary) 14%, white)",
                  color: "var(--pb-text)",
                }}
              >
                {initials}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold leading-tight tracking-tight sm:text-xl">
              {salonName}
            </h1>
            {headerStyle !== "compact" && (
              <p
                className="mt-0.5 line-clamp-1 text-xs leading-snug sm:text-sm"
                style={{
                  color: tokens.colors.mutedText,
                  minHeight: "1rem",
                }}
              >
                {safeSubtitle}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex min-h-5 items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
                style={{
                  border: `1px solid ${tokens.colors.border}`,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.mutedText,
                }}
              >
                {payInSalonBadge}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition hover:opacity-90 sm:inline-flex"
                style={{
                  border: `1px solid ${tokens.colors.border}`,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.mutedText,
                }}
              >
                Chat on WhatsApp
              </a>
            ) : null}

            {supportedLocales.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs font-medium outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pb-bg)]"
                    style={{
                      border: `1px solid ${tokens.colors.border}`,
                      backgroundColor: tokens.colors.surface,
                      color: tokens.colors.mutedText,
                    }}
                    aria-label="Language"
                    title="Language"
                  >
                    <span className="text-sm leading-none">{LANG_FLAGS[currentLocale] || "🌐"}</span>
                    <span className="hidden sm:inline">{LANG_LABELS[currentLocale] || currentLocale.toUpperCase()}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  {supportedLocales.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      className="cursor-pointer"
                      onClick={() => {
                        onLocaleChange(lang);
                        if (typeof window !== "undefined" && salonId) {
                          localStorage.setItem(`booking-locale-${salonId}`, lang);
                        }
                      }}
                    >
                      <span className="mr-2">{LANG_FLAGS[lang] || "🌐"}</span>
                      <span>{LANG_LABELS[lang] || lang}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={modeSelectorLabel}
          className="grid grid-cols-2 gap-2 rounded-xl border p-1"
          style={{
            borderColor: "var(--pb-border)",
            backgroundColor: "var(--pb-surface)",
          }}
        >
          <button
            type="button"
            role="tab"
            id="book-mode-tab"
            aria-controls="book-mode-panel"
            aria-selected={mode === "book"}
            className="h-11 min-h-11 truncate whitespace-nowrap rounded-lg px-3 text-sm font-medium transition"
            onClick={() => onModeChange("book")}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") onModeChange("waitlist");
            }}
            style={
              mode === "book"
                ? { backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText }
                : { backgroundColor: "transparent", color: tokens.colors.mutedText }
            }
          >
            {modeBookTimeLabel}
          </button>
          <button
            type="button"
            role="tab"
            id="waitlist-mode-tab"
            aria-controls="waitlist-mode-panel"
            aria-selected={mode === "waitlist"}
            className="h-11 min-h-11 truncate whitespace-nowrap rounded-lg px-3 text-sm font-medium transition"
            onClick={() => onModeChange("waitlist")}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") onModeChange("book");
            }}
            style={
              mode === "waitlist"
                ? { backgroundColor: tokens.colors.primary, color: tokens.colors.primaryText }
                : { backgroundColor: "transparent", color: tokens.colors.mutedText }
            }
          >
            {modeWaitlistLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
