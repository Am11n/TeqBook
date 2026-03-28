// =====================================================
// Plan matrix allowlist (admin Plan Features UI)
// =====================================================
// Single source of truth for which feature keys appear in the matrix
// and bulk actions. Must stay aligned with dashboard-enforced features.

const MATRIX_SECTIONS = [
  { label: "Booking & Calendar", keys: ["BOOKINGS", "CALENDAR"] as const },
  { label: "Staff & Operations", keys: ["SHIFTS", "ROLES_ACCESS"] as const },
  {
    label: "Notifications",
    keys: ["SMS_NOTIFICATIONS", "EMAIL_NOTIFICATIONS", "WHATSAPP"] as const,
  },
  {
    label: "Reporting & Data",
    keys: ["ADVANCED_REPORTS", "EXPORTS", "CUSTOMER_HISTORY"] as const,
  },
  { label: "Products", keys: ["INVENTORY"] as const },
  { label: "Branding & Language", keys: ["BRANDING", "MULTILINGUAL"] as const },
] as const;

export type MatrixFeatureKey = (typeof MATRIX_SECTIONS)[number]["keys"][number];

/** Stable category → keys map for the matrix UI */
export const MATRIX_FEATURE_CATEGORIES: Record<string, MatrixFeatureKey[]> =
  Object.fromEntries(MATRIX_SECTIONS.map((s) => [s.label, [...s.keys]]));

/** All matrix keys in display order (sections top-to-bottom, keys left-to-right) */
export const MATRIX_FEATURE_KEYS: MatrixFeatureKey[] = MATRIX_SECTIONS.flatMap(
  (s) => [...s.keys]
);

const KEY_SET = new Set<string>(MATRIX_FEATURE_KEYS);

export function isMatrixFeatureKey(key: string): key is MatrixFeatureKey {
  return KEY_SET.has(key);
}
