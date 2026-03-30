import type { AppLocale } from "@/i18n/translations";
import { LANGUAGE_LABELS } from "./profile-language-labels";

export function formatProfileLanguageLabel(codeOrName: string, locale: AppLocale): string {
  const value = codeOrName.trim();
  if (!value) return "Language";
  const normalized = value.toLowerCase();
  try {
    const displayLocale = locale === "nb" ? "nb-NO" : locale;
    const names = new Intl.DisplayNames([displayLocale], { type: "language" });
    const translated = names.of(normalized);
    if (translated && translated.toLowerCase() !== normalized) return translated;
  } catch {
    // Fall back to static labels.
  }
  return LANGUAGE_LABELS[normalized] || value;
}
