import type { AppLocale } from "@/i18n/translations";

/** BCP 47 tags for `Intl` / `toLocaleDateString` from dashboard `AppLocale`. */
const INTL_LOCALE_BY_APP: Record<AppLocale, string> = {
  en: "en-US",
  nb: "nb-NO",
  ar: "ar",
  so: "so-SO",
  ti: "ti-ER",
  am: "am-ET",
  tr: "tr-TR",
  pl: "pl-PL",
  vi: "vi-VN",
  zh: "zh-CN",
  tl: "fil-PH",
  fa: "fa-IR",
  dar: "fa-AF",
  ur: "ur-PK",
  hi: "hi-IN",
};

export function intlLocaleTag(locale: AppLocale): string {
  return INTL_LOCALE_BY_APP[locale] ?? "en-US";
}
