import { translations } from "@/i18n/translations";
import type { TranslationNamespaces } from "@/i18n/types";

export type ResolvedNamespace<K extends keyof TranslationNamespaces> = Required<
  TranslationNamespaces[K]
>;

export function resolveNamespace<K extends keyof TranslationNamespaces>(
  key: K,
  partial: TranslationNamespaces[K],
): ResolvedNamespace<K> {
  return {
    ...translations.en[key],
    ...partial,
  } as ResolvedNamespace<K>;
}
