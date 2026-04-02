import type { AppLocale } from "./app-locale";

/** BCP 47 tags for Intl (best-effort; unknown codes fall back to en-US). */
const MAP: Record<AppLocale, string> = {
  en: "en-US",
  nb: "nb-NO",
  ar: "ar",
  so: "so-SO",
  ti: "ti-ET",
  am: "am-ET",
  tr: "tr-TR",
  pl: "pl-PL",
  vi: "vi-VN",
  zh: "zh-CN",
  tl: "fil-PH",
  fa: "fa-IR",
  dar: "prs-AF",
  ur: "ur-PK",
  hi: "hi-IN",
};

export function appLocaleToBcp47(locale: string): string {
  return MAP[locale as AppLocale] ?? "en-US";
}
