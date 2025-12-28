import type { AppLocale } from "./translations";

/**
 * Normalizes a locale string to a valid AppLocale
 * 
 * Handles various input formats and maps them to supported locales:
 * - Direct matches (e.g., "nb" -> "nb")
 * - Language codes (e.g., "no" -> "nb")
 * - Fallback to "en" for unsupported locales
 * 
 * @param locale - The locale string to normalize
 * @returns A valid AppLocale
 * 
 * @example
 * ```ts
 * normalizeLocale("nb") // "nb"
 * normalizeLocale("no") // "nb"
 * normalizeLocale("en-US") // "en"
 * normalizeLocale("unknown") // "en"
 * ```
 */
export function normalizeLocale(locale: string | null | undefined): AppLocale {
  if (!locale) {
    return "en";
  }

  const normalized = locale.toLowerCase().trim();

  // Direct matches
  const supportedLocales: AppLocale[] = [
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

  if (supportedLocales.includes(normalized as AppLocale)) {
    return normalized as AppLocale;
  }

  // Handle language code variations
  const localeMap: Record<string, AppLocale> = {
    "no": "nb", // Norwegian Bokmål
    "nn": "nb", // Norwegian Nynorsk -> fallback to Bokmål
    "en-us": "en",
    "en-gb": "en",
    "ar-sa": "ar",
    "ar-ae": "ar",
    "so-so": "so",
    "ti-er": "ti",
    "am-et": "am",
    "tr-tr": "tr",
    "pl-pl": "pl",
    "vi-vn": "vi",
    "zh-cn": "zh",
    "zh-tw": "zh",
    "tl-ph": "tl",
    "fa-ir": "fa",
    "fa-af": "fa",
    "ur-pk": "ur",
    "ur-in": "ur",
    "hi-in": "hi",
  };

  // Check if it's a language-region code (e.g., "en-US")
  const parts = normalized.split("-");
  const languageCode = parts[0];
  
  if (localeMap[normalized]) {
    return localeMap[normalized];
  }
  
  if (localeMap[languageCode]) {
    return localeMap[languageCode];
  }

  // Check if language code alone is supported
  if (supportedLocales.includes(languageCode as AppLocale)) {
    return languageCode as AppLocale;
  }

  // Default fallback
  return "en";
}

