import type { AppLocale } from "./translations";

/** Locales available in the public booking flow and salon profile language picker. */
export const BOOKING_APP_LOCALES: AppLocale[] = [
  "nb",
  "en",
  "ar",
  "so",
  "ti",
  "am",
  "tr",
  "pl",
  "vi",
  "zh",
  "tl",
  "fa",
  "dar",
  "ur",
  "hi",
];

export const BOOKING_LANG_LABELS: Record<AppLocale, string> = {
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

export const BOOKING_LANG_FLAGS: Record<AppLocale, string> = {
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

const bookingLocaleSet = new Set<string>(BOOKING_APP_LOCALES);

export function filterSupportedBookingLocales(
  raw: string[] | null | undefined,
): AppLocale[] {
  const out: AppLocale[] = [];
  const seen = new Set<AppLocale>();
  for (const code of raw ?? []) {
    const lang = code as AppLocale;
    if (!bookingLocaleSet.has(lang)) continue;
    if (seen.has(lang)) continue;
    seen.add(lang);
    out.push(lang);
  }
  return out;
}
