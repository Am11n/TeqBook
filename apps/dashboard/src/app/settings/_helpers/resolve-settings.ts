import { translations } from "@/i18n/translations";
import type { TranslationNamespaces } from "@/i18n/types";

export type ResolvedSettingsMessages = Required<TranslationNamespaces["settings"]>;

export function resolveSettings(
  t: TranslationNamespaces["settings"],
): ResolvedSettingsMessages {
  return { ...translations.en.settings, ...t } as ResolvedSettingsMessages;
}
