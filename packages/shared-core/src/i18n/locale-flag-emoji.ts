/**
 * App locale rows for staff/salon language pickers: native label + representative flag emoji.
 * (Language ≠ one country; flags are a visual aid only.)
 */
export const APP_LOCALE_PICKER_ROWS = [
  { value: "nb", label: "Norsk", flagEmoji: "🇳🇴" },
  { value: "en", label: "English", flagEmoji: "🇬🇧" },
  { value: "ar", label: "العربية", flagEmoji: "🇸🇦" },
  { value: "so", label: "Soomaali", flagEmoji: "🇸🇴" },
  { value: "ti", label: "ትግርኛ", flagEmoji: "🇪🇷" },
  { value: "am", label: "አማርኛ", flagEmoji: "🇪🇹" },
  { value: "tr", label: "Türkçe", flagEmoji: "🇹🇷" },
  { value: "pl", label: "Polski", flagEmoji: "🇵🇱" },
  { value: "vi", label: "Tiếng Việt", flagEmoji: "🇻🇳" },
  { value: "tl", label: "Tagalog", flagEmoji: "🇵🇭" },
  { value: "zh", label: "中文", flagEmoji: "🇨🇳" },
  { value: "fa", label: "فارسی", flagEmoji: "🇮🇷" },
  { value: "dar", label: "دری (Dari)", flagEmoji: "🇦🇫" },
  { value: "ur", label: "اردو", flagEmoji: "🇵🇰" },
  { value: "hi", label: "हिन्दी", flagEmoji: "🇮🇳" },
] as const;

export type AppLocalePickerValue = (typeof APP_LOCALE_PICKER_ROWS)[number]["value"];

export const LOCALE_FLAG_EMOJI = Object.fromEntries(
  APP_LOCALE_PICKER_ROWS.map((r) => [r.value, r.flagEmoji]),
) as Record<AppLocalePickerValue, string>;

/** @deprecated Use AppLocalePickerValue — same set of keys. */
export type LocaleFlagEmojiKey = AppLocalePickerValue;
