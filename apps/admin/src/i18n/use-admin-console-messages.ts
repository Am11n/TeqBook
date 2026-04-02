"use client";

import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import type { AppLocale } from "@/i18n/translations";
import { getAdminConsoleMessages } from "@/i18n/admin-console";
import type { AdminConsoleMessages } from "@/i18n/admin-console";

const VALID = new Set<string>([
  "nb", "en", "ar", "so", "ti", "am", "tr", "pl", "vi", "zh", "tl", "fa", "dar", "ur", "hi",
]);

export function useAdminConsoleMessages(): AdminConsoleMessages {
  const { locale } = useLocale();
  const appLocale = (VALID.has(locale) ? locale : normalizeLocale(locale)) as AppLocale;
  return getAdminConsoleMessages(appLocale);
}
