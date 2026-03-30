import type { AppLocale } from "./translations";

// All AppLocale values are exposed; CI gates (parity, max-lines, english-leak, etc.) block regressions.
// Temporarily hide a locale here only with an explicit product decision and PR note.
export const EXPOSED_PUBLIC_LOCALES: readonly AppLocale[] = [
  "en",
  "nb",
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

export function isExposedPublicLocale(locale: string): locale is AppLocale {
  return (EXPOSED_PUBLIC_LOCALES as readonly string[]).includes(locale);
}
