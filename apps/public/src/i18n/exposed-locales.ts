import type { AppLocale } from "./translations";

// Release policy: only locales that passed parity + basic QA are exposed.
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
