/**
 * Utility functions for products
 */

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

