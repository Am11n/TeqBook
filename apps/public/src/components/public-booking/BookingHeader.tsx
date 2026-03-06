import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@teqbook/ui";
import type { AppLocale } from "@/i18n/translations";
import type { BookingMode, PublicBookingEffectiveBranding, PublicBookingTokens, Salon, WaitlistEntrySource } from "./types";

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

const APP_LOCALES = Object.keys(LANG_LABELS) as AppLocale[];

type BookingHeaderProps = {
  salon: Salon;
  mode: BookingMode;
  activeStep: 1 | 2 | 3;
  tokens: PublicBookingTokens;
  effectiveBranding: PublicBookingEffectiveBranding;
  modeBookTimeLabel: string;
  modeWaitlistLabel: string;
  modeSelectorLabel: string;
  handleModeChange: (mode: BookingMode, source?: WaitlistEntrySource) => void;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  headerSubtitle: string;
  payInSalonBadge: string;
};

export function BookingHeader({
  salon,
  mode,
  activeStep,
  tokens,
  effectiveBranding,
  modeBookTimeLabel,
  modeWaitlistLabel,
  modeSelectorLabel,
  handleModeChange,
  locale,
  setLocale,
  headerSubtitle,
  payInSalonBadge,
}: BookingHeaderProps) {
  const logoUrl = effectiveBranding.logoUrl;
  const supportedLocales = (salon.supported_languages ?? [])
    .filter((lang): lang is AppLocale => APP_LOCALES.includes(lang as AppLocale));
  const currentLocale = supportedLocales.includes(locale) ? locale : (supportedLocales[0] ?? "en");

  return (
    <header
      className="relative sticky top-0 z-20 border-b px-4 py-4 backdrop-blur-md sm:px-6"
      style={{
        backgroundColor: tokens.colors.surface,
        borderColor: tokens.colors.border,
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={salon.name}
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="mb-2 h-9 w-auto object-contain"
              />
            )}
            <h1 className="text-lg font-semibold tracking-tight">
              {salon.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs" style={{ color: tokens.colors.mutedText }}>
                {headerSubtitle}
              </p>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wide"
                style={{
                  border: `1px solid ${tokens.colors.border}`,
                  backgroundColor: tokens.colors.surface2,
                  color: tokens.colors.mutedText,
                }}
              >
                {payInSalonBadge}
              </span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs sm:mt-0">
            {salon.whatsapp_number && (
              <a
                href={`https://wa.me/${salon.whatsapp_number.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  border: `1px solid ${tokens.colors.border}`,
                  backgroundColor: tokens.colors.surface2,
                  color: tokens.colors.mutedText,
                }}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Chat on WhatsApp
              </a>
            )}
            {supportedLocales.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-xs font-medium outline-none transition hover:opacity-90 focus-visible:ring-2"
                    style={{
                      border: `1px solid ${tokens.colors.border}`,
                      backgroundColor: tokens.colors.surface2,
                      color: tokens.colors.mutedText,
                    }}
                    aria-label="Language"
                    title="Language"
                  >
                    <span className="text-sm leading-none">{LANG_FLAGS[currentLocale] || "🌐"}</span>
                    <span>{LANG_LABELS[currentLocale] || currentLocale.toUpperCase()}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  {supportedLocales.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      className="cursor-pointer"
                      onClick={() => {
                        setLocale(lang);
                        if (typeof window !== "undefined" && salon.id) {
                          localStorage.setItem(`booking-locale-${salon.id}`, lang);
                        }
                      }}
                    >
                      <span className="mr-2">{LANG_FLAGS[lang] || "🌐"}</span>
                      <span>{LANG_LABELS[lang] || lang}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={modeSelectorLabel}
          className="grid grid-cols-2 gap-2 rounded-xl p-1"
          style={{ backgroundColor: tokens.colors.surface2, border: `1px solid ${tokens.colors.border}` }}
        >
          <button
            type="button"
            role="tab"
            id="book-mode-tab"
            aria-controls="book-mode-panel"
            aria-selected={mode === "book"}
            className="h-10 rounded-lg px-3 text-sm font-medium transition"
            onClick={() => handleModeChange("book")}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") handleModeChange("waitlist");
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
            className="h-10 rounded-lg px-3 text-sm font-medium transition"
            onClick={() => handleModeChange("waitlist")}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") handleModeChange("book");
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
        <span className="sr-only">Step {activeStep} of 3</span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, var(--pb-primary), transparent)",
          opacity: 0.35,
        }}
      />
    </header>
  );
}
