import type { AppLocale } from "@/i18n/translations";

export type SalonPublicLocaleSource = {
  id: string;
  supported_languages?: string[] | null;
  default_language?: string | null;
  preferred_language?: string | null;
};

/**
 * Same rules as the main public booking flow: prefer per-salon localStorage
 * (`booking-locale-${salon.id}`) when listed in supported_languages, else salon
 * default/preferred, only if that value is in supported_languages.
 */
export function resolvePublicBookingUiLocale(salon: SalonPublicLocaleSource): AppLocale | null {
  if (typeof window === "undefined") return null;

  const storedLocale = localStorage.getItem(`booking-locale-${salon.id}`);
  const supported = salon.supported_languages ?? [];
  const fallback = (salon.default_language || salon.preferred_language || "en") as AppLocale;
  const preferred =
    storedLocale && supported.includes(storedLocale)
      ? (storedLocale as AppLocale)
      : fallback;

  return supported.includes(preferred) ? preferred : null;
}
