/**
 * Format price from cents to NOK currency string
 */
export function formatPrice(cents: number, locale: string): string {
  return (cents / 100).toLocaleString(locale === "nb" ? "nb-NO" : "en-US", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
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

