import { describe, expect, it } from "vitest";
import { translations, type AppLocale } from "@/i18n/translations";
import { ALL_APP_LOCALES, PROD_LOCALE_ALLOWLIST } from "@/i18n/locale-policy";

type StringMap = Record<string, string>;

const PLACEHOLDER_REGEX = /\{\{?\w+\}?\}/g;

function flattenStringLeaves(value: unknown, prefix = "", out: StringMap = {}): StringMap {
  if (typeof value === "string") {
    out[prefix] = value;
    return out;
  }

  if (!value || typeof value !== "object") {
    return out;
  }

  for (const [key, next] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    flattenStringLeaves(next, path, out);
  }

  return out;
}

function extractPlaceholders(value: string): string[] {
  return [...(value.match(PLACEHOLDER_REGEX) ?? [])].sort();
}

describe("dashboard i18n parity gates", () => {
  it("keeps locale lists in sync", () => {
    const allLocalesFromTranslations = Object.keys(translations).sort();
    expect(ALL_APP_LOCALES.slice().sort()).toEqual(allLocalesFromTranslations);
    expect(PROD_LOCALE_ALLOWLIST.every((locale) => allLocalesFromTranslations.includes(locale))).toBe(true);
  });

  it("matches english key-set for prod-exposed locales", () => {
    const baseline = flattenStringLeaves(translations.en);
    const baselinePaths = Object.keys(baseline).sort();

    for (const locale of PROD_LOCALE_ALLOWLIST) {
      const localized = flattenStringLeaves(translations[locale as AppLocale]);
      const localizedPaths = Object.keys(localized).sort();
      expect(localizedPaths, `missing/extra keys for locale ${locale}`).toEqual(baselinePaths);
    }
  });

  it("prevents empty required strings and placeholder mismatches for prod-exposed locales", () => {
    const baseline = flattenStringLeaves(translations.en);
    const baselineEntries = Object.entries(baseline);

    for (const locale of PROD_LOCALE_ALLOWLIST) {
      const localized = flattenStringLeaves(translations[locale as AppLocale]);

      for (const [path, englishValue] of baselineEntries) {
        const localizedValue = localized[path];
        expect(typeof localizedValue, `${locale}:${path} must exist`).toBe("string");
        expect(localizedValue.trim().length > 0, `${locale}:${path} cannot be empty`).toBe(true);

        expect(
          extractPlaceholders(localizedValue),
          `${locale}:${path} placeholder mismatch`,
        ).toEqual(extractPlaceholders(englishValue));
      }
    }
  });
});

