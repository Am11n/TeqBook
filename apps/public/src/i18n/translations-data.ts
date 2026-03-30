import type { AppLocale, TranslationNamespaces } from "./translation-types";
import { nb } from "./nb";
import { en } from "./en";
import { so } from "./so";
import { ar } from "./ar";
import { ti } from "./ti";
import { am } from "./am";
import { tr } from "./tr";
import { pl } from "./pl";
import { vi } from "./vi";
import { zh } from "./zh";
import { tl } from "./tl";
import { fa } from "./fa";
import { dar } from "./dar";
import { ur } from "./ur";
import { hi } from "./hi";

export const translations: Record<AppLocale, TranslationNamespaces> = {
  nb,
  en,
  so,
  ar,
  am,
  ti,
  tr,
  pl,
  vi,
  zh,
  tl,
  fa,
  dar,
  ur,
  hi,
};

export function getStrictTranslation<K extends keyof TranslationNamespaces>(
  locale: AppLocale,
  namespace: K,
): NonNullable<TranslationNamespaces[K]> {
  const value = translations[locale][namespace];
  if (value == null) {
    throw new Error(
      `Missing translation namespace "${String(namespace)}" for locale "${locale}"`,
    );
  }
  return value as NonNullable<TranslationNamespaces[K]>;
}
