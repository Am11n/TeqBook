// =====================================================
// Country-to-Timezone Mapping
// =====================================================
// Used in onboarding to set the salon's IANA timezone
// based on the country the salon is located in.
// Language and country are independent choices.

export type CountryTimezone = {
  code: string;
  label: string;
  timezone: string;
};

/**
 * Countries covering TeqBook's user base.
 * Sorted with Nordic countries first, then alphabetical.
 */
export const COUNTRIES: CountryTimezone[] = [
  // Nordic (primary market)
  { code: "NO", label: "🇳🇴 Norway", timezone: "Europe/Oslo" },
  { code: "SE", label: "🇸🇪 Sweden", timezone: "Europe/Stockholm" },
  { code: "DK", label: "🇩🇰 Denmark", timezone: "Europe/Copenhagen" },
  { code: "FI", label: "🇫🇮 Finland", timezone: "Europe/Helsinki" },
  { code: "IS", label: "🇮🇸 Iceland", timezone: "Atlantic/Reykjavik" },

  // Europe
  { code: "GB", label: "🇬🇧 United Kingdom", timezone: "Europe/London" },
  { code: "DE", label: "🇩🇪 Germany", timezone: "Europe/Berlin" },
  { code: "NL", label: "🇳🇱 Netherlands", timezone: "Europe/Amsterdam" },
  { code: "FR", label: "🇫🇷 France", timezone: "Europe/Paris" },
  { code: "ES", label: "🇪🇸 Spain", timezone: "Europe/Madrid" },
  { code: "IT", label: "🇮🇹 Italy", timezone: "Europe/Rome" },
  { code: "PL", label: "🇵🇱 Poland", timezone: "Europe/Warsaw" },
  { code: "TR", label: "🇹🇷 Turkey", timezone: "Europe/Istanbul" },
  { code: "AT", label: "🇦🇹 Austria", timezone: "Europe/Vienna" },
  { code: "CH", label: "🇨🇭 Switzerland", timezone: "Europe/Zurich" },
  { code: "BE", label: "🇧🇪 Belgium", timezone: "Europe/Brussels" },
  { code: "PT", label: "🇵🇹 Portugal", timezone: "Europe/Lisbon" },
  { code: "IE", label: "🇮🇪 Ireland", timezone: "Europe/Dublin" },
  { code: "GR", label: "🇬🇷 Greece", timezone: "Europe/Athens" },

  // Middle East
  { code: "AE", label: "🇦🇪 United Arab Emirates", timezone: "Asia/Dubai" },
  { code: "SA", label: "🇸🇦 Saudi Arabia", timezone: "Asia/Riyadh" },
  { code: "IQ", label: "🇮🇶 Iraq", timezone: "Asia/Baghdad" },
  { code: "IR", label: "🇮🇷 Iran", timezone: "Asia/Tehran" },

  // Africa
  { code: "SO", label: "🇸🇴 Somalia", timezone: "Africa/Mogadishu" },
  { code: "ET", label: "🇪🇹 Ethiopia", timezone: "Africa/Addis_Ababa" },
  { code: "ER", label: "🇪🇷 Eritrea", timezone: "Africa/Asmara" },

  // South Asia
  { code: "PK", label: "🇵🇰 Pakistan", timezone: "Asia/Karachi" },
  { code: "IN", label: "🇮🇳 India", timezone: "Asia/Kolkata" },
  { code: "AF", label: "🇦🇫 Afghanistan", timezone: "Asia/Kabul" },

  // East & Southeast Asia
  { code: "CN", label: "🇨🇳 China", timezone: "Asia/Shanghai" },
  { code: "VN", label: "🇻🇳 Vietnam", timezone: "Asia/Ho_Chi_Minh" },
  { code: "PH", label: "🇵🇭 Philippines", timezone: "Asia/Manila" },

  // Americas
  { code: "US-E", label: "🇺🇸 United States (East)", timezone: "America/New_York" },
  { code: "US-C", label: "🇺🇸 United States (Central)", timezone: "America/Chicago" },
  { code: "US-W", label: "🇺🇸 United States (West)", timezone: "America/Los_Angeles" },
  { code: "CA", label: "🇨🇦 Canada (East)", timezone: "America/Toronto" },

  // Oceania
  { code: "AU-E", label: "🇦🇺 Australia (East)", timezone: "Australia/Sydney" },
  { code: "NZ", label: "🇳🇿 New Zealand", timezone: "Pacific/Auckland" },
];

export const DEFAULT_COUNTRY = "NO";

/**
 * Get timezone for a country code. Falls back to Europe/Oslo.
 */
export function getTimezoneForCountry(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.timezone ?? "Europe/Oslo";
}

/**
 * Get country label for a country code.
 */
export function getCountryLabel(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}
