import type { AppLocale } from "./app-locale";

const RTL = new Set<AppLocale>(["ar", "fa", "ur", "dar"]);

export function isRtlLocale(locale: AppLocale): boolean {
  return RTL.has(locale);
}
