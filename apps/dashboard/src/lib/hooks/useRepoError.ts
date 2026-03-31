import { useCallback, useMemo } from "react";
import { useLocale } from "@/components/locale-provider";
import { normalizeLocale } from "@/i18n/normalizeLocale";
import { translations } from "@/i18n/translations";
import { resolveNamespace } from "@/i18n/resolve-namespace";
import { mapRepoError } from "@/lib/i18n/map-repo-error";

export function useRepoErrors() {
  const { locale } = useLocale();
  const appLocale = normalizeLocale(locale);
  return useMemo(
    () => resolveNamespace("repoErrors", translations[appLocale].repoErrors),
    [appLocale],
  );
}

export function useRepoError() {
  const tr = useRepoErrors();
  return useCallback((error: string | null | undefined) => mapRepoError(error, tr), [tr]);
}
