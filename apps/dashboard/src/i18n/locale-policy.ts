import type { AppLocale } from "./translations";
import { normalizeLocale } from "./normalizeLocale";

export const ALL_APP_LOCALES: AppLocale[] = [
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

const DEFAULT_PROD_ALLOWLIST: AppLocale[] = ["en", "nb"];

const RTL_LOCALES = new Set<AppLocale>(["ar", "fa", "ur"]);

function parseAllowlist(raw: string | undefined): AppLocale[] {
  if (!raw?.trim()) {
    return DEFAULT_PROD_ALLOWLIST;
  }

  const parsed = raw
    .split(",")
    .map((value) => normalizeLocale(value))
    .filter((value, index, arr) => arr.indexOf(value) === index);

  return parsed.length > 0 ? parsed : DEFAULT_PROD_ALLOWLIST;
}

export const PROD_LOCALE_ALLOWLIST: AppLocale[] = parseAllowlist(
  process.env.NEXT_PUBLIC_DASHBOARD_LOCALE_ALLOWLIST,
);

export function isLocaleEnabledInProd(locale: string): boolean {
  return PROD_LOCALE_ALLOWLIST.includes(normalizeLocale(locale));
}

export function clampToEnabledLocale(locale: string): AppLocale {
  const normalized = normalizeLocale(locale);
  if (PROD_LOCALE_ALLOWLIST.includes(normalized)) {
    return normalized;
  }
  return PROD_LOCALE_ALLOWLIST[0] ?? "en";
}

export function getDocumentDirection(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.has(normalizeLocale(locale)) ? "rtl" : "ltr";
}

