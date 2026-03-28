import { describe, expect, it } from "vitest";
import {
  MATRIX_FEATURE_CATEGORIES,
  MATRIX_FEATURE_KEYS,
  isMatrixFeatureKey,
  type MatrixFeatureKey,
} from "./matrix-feature-keys";

const EXPECTED_KEYS: MatrixFeatureKey[] = [
  "BOOKINGS",
  "CALENDAR",
  "SHIFTS",
  "ROLES_ACCESS",
  "SMS_NOTIFICATIONS",
  "EMAIL_NOTIFICATIONS",
  "WHATSAPP",
  "ADVANCED_REPORTS",
  "EXPORTS",
  "CUSTOMER_HISTORY",
  "INVENTORY",
  "BRANDING",
  "MULTILINGUAL",
];

describe("matrix-feature-keys", () => {
  it("exports stable ordered keys with no duplicates", () => {
    expect(MATRIX_FEATURE_KEYS).toEqual(EXPECTED_KEYS);
    const unique = new Set(MATRIX_FEATURE_KEYS);
    expect(unique.size).toBe(MATRIX_FEATURE_KEYS.length);
  });

  it("categories partition keys exactly once", () => {
    const fromCategories = Object.values(MATRIX_FEATURE_CATEGORIES).flat();
    expect(fromCategories).toEqual(MATRIX_FEATURE_KEYS);
  });

  it("isMatrixFeatureKey narrows and rejects removed / unknown keys", () => {
    expect(isMatrixFeatureKey("BOOKINGS")).toBe(true);
    expect(isMatrixFeatureKey("ONLINE_PAYMENTS")).toBe(false);
    expect(isMatrixFeatureKey("SUPPORT")).toBe(false);
    expect(isMatrixFeatureKey("ADVANCED_PERMISSIONS")).toBe(false);
  });
});
