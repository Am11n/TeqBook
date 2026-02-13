import { resolveIntlLocale } from "@/lib/utils/currencies";

/**
 * Format price from minor units (cents/øre) to a localized currency string.
 *
 * - Uses Intl.NumberFormat for proper symbol placement and separators.
 * - Lets Intl decide fraction digits per currency (JPY=0, NOK/USD=2, BHD=3).
 * - `minimumFractionDigits: 0` so round amounts like 800.00 show as "800 kr".
 */
export function formatPrice(
  cents: number,
  locale: string,
  currency: string = "NOK",
): string {
  return (cents / 100).toLocaleString(resolveIntlLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });
}

/**
 * Get category label from category value
 */
export function getCategoryLabel(
  category: string | null | undefined,
  translations: {
    categoryCut: string;
    categoryBeard: string;
    categoryColor: string;
    categoryNails: string;
    categoryMassage: string;
    categoryOther: string;
  }
): string {
  switch (category) {
    case "cut":
      return translations.categoryCut;
    case "beard":
      return translations.categoryBeard;
    case "color":
      return translations.categoryColor;
    case "nails":
      return translations.categoryNails;
    case "massage":
      return translations.categoryMassage;
    default:
      return translations.categoryOther;
  }
}
