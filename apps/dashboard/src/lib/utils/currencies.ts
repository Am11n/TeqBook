// =====================================================
// Currency Utilities
// =====================================================
// ISO 4217 currency list (grouped) and locale resolution.
// Used by the Settings page and formatPrice().

export type CurrencyDef = {
  code: string;
  name: string;
  group: string;
};

/**
 * Major world currencies, grouped by region.
 * ~35 entries -- enough for any SaaS salon product.
 */
export const CURRENCIES: CurrencyDef[] = [
  // Nordic
  { code: "NOK", name: "Norwegian Krone", group: "Nordic" },
  { code: "SEK", name: "Swedish Krona", group: "Nordic" },
  { code: "DKK", name: "Danish Krone", group: "Nordic" },
  { code: "ISK", name: "Icelandic Krona", group: "Nordic" },

  // Europe
  { code: "EUR", name: "Euro", group: "Europe" },
  { code: "GBP", name: "British Pound", group: "Europe" },
  { code: "CHF", name: "Swiss Franc", group: "Europe" },
  { code: "PLN", name: "Polish Zloty", group: "Europe" },
  { code: "CZK", name: "Czech Koruna", group: "Europe" },
  { code: "RON", name: "Romanian Leu", group: "Europe" },
  { code: "HUF", name: "Hungarian Forint", group: "Europe" },
  { code: "TRY", name: "Turkish Lira", group: "Europe" },

  // Middle East & Africa
  { code: "SAR", name: "Saudi Riyal", group: "Middle East & Africa" },
  { code: "AED", name: "UAE Dirham", group: "Middle East & Africa" },
  { code: "QAR", name: "Qatari Riyal", group: "Middle East & Africa" },
  { code: "KWD", name: "Kuwaiti Dinar", group: "Middle East & Africa" },
  { code: "BHD", name: "Bahraini Dinar", group: "Middle East & Africa" },
  { code: "ILS", name: "Israeli Shekel", group: "Middle East & Africa" },
  { code: "EGP", name: "Egyptian Pound", group: "Middle East & Africa" },
  { code: "ZAR", name: "South African Rand", group: "Middle East & Africa" },

  // Americas
  { code: "USD", name: "US Dollar", group: "Americas" },
  { code: "CAD", name: "Canadian Dollar", group: "Americas" },
  { code: "MXN", name: "Mexican Peso", group: "Americas" },
  { code: "BRL", name: "Brazilian Real", group: "Americas" },

  // Asia-Pacific
  { code: "JPY", name: "Japanese Yen", group: "Asia-Pacific" },
  { code: "CNY", name: "Chinese Yuan", group: "Asia-Pacific" },
  { code: "KRW", name: "South Korean Won", group: "Asia-Pacific" },
  { code: "INR", name: "Indian Rupee", group: "Asia-Pacific" },
  { code: "PKR", name: "Pakistani Rupee", group: "Asia-Pacific" },
  { code: "THB", name: "Thai Baht", group: "Asia-Pacific" },
  { code: "PHP", name: "Philippine Peso", group: "Asia-Pacific" },
  { code: "VND", name: "Vietnamese Dong", group: "Asia-Pacific" },
  { code: "AUD", name: "Australian Dollar", group: "Asia-Pacific" },
  { code: "NZD", name: "New Zealand Dollar", group: "Asia-Pacific" },
  { code: "SGD", name: "Singapore Dollar", group: "Asia-Pacific" },
];

/** Get unique groups in order */
export function getCurrencyGroups(): string[] {
  const seen = new Set<string>();
  return CURRENCIES.reduce<string[]>((groups, c) => {
    if (!seen.has(c.group)) {
      seen.add(c.group);
      groups.push(c.group);
    }
    return groups;
  }, []);
}

/**
 * Map app locale codes to BCP 47 locale tags for Intl.NumberFormat.
 *
 * The app uses short codes ("nb", "en", "ar", etc.).
 * Intl.NumberFormat needs full tags for correct thousand/decimal separators
 * and currency symbol positioning.
 */
const LOCALE_MAP: Record<string, string> = {
  nb: "nb-NO",
  en: "en-US",
  ar: "ar-SA",
  so: "so-SO",
  ti: "ti-ER",
  am: "am-ET",
  tr: "tr-TR",
  pl: "pl-PL",
  vi: "vi-VN",
  zh: "zh-CN",
  tl: "tl-PH",
  fa: "fa-IR",
  dar: "fa-AF",
  ur: "ur-PK",
  hi: "hi-IN",
};

/**
 * Resolve an app locale to a full BCP 47 tag.
 * Falls back to "en-US" for unknown locales.
 */
export function resolveIntlLocale(appLocale: string): string {
  return LOCALE_MAP[appLocale] ?? "en-US";
}
