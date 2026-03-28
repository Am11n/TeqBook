// =====================================================
// Feature Limits Config
// =====================================================
// Typed configuration for how each feature's limit is
// displayed and edited in the Plan Features matrix.
// This avoids free-text chaos in limit_value.

import {
  MATRIX_FEATURE_CATEGORIES,
  type MatrixFeatureKey,
} from "@/lib/plan-features/matrix-feature-keys";

export type LimitType = "none" | "numeric";

export type FeatureLimitConfig = {
  limitType: LimitType;
  /** Unit label shown next to numeric input (e.g. "languages") */
  unit?: string;
};

/**
 * Defines how each matrix feature key handles limits in the admin UI.
 * - "none": checkbox only, no limit input (on/off)
 * - "numeric": checkbox + number input with unit label; null = unlimited
 */
export const FEATURE_LIMITS: Record<MatrixFeatureKey, FeatureLimitConfig> = {
  BOOKINGS: { limitType: "none" },
  CALENDAR: { limitType: "none" },
  SHIFTS: { limitType: "none" },
  ADVANCED_REPORTS: { limitType: "none" },
  MULTILINGUAL: { limitType: "numeric", unit: "languages" },
  SMS_NOTIFICATIONS: { limitType: "numeric", unit: "per month" },
  EMAIL_NOTIFICATIONS: { limitType: "none" },
  WHATSAPP: { limitType: "none" },
  INVENTORY: { limitType: "none" },
  BRANDING: { limitType: "none" },
  ROLES_ACCESS: { limitType: "none" },
  EXPORTS: { limitType: "none" },
  CUSTOMER_HISTORY: { limitType: "none" },
};

/**
 * Category grouping for the matrix UI (same keys as matrix allowlist).
 * Order of keys = order of sections in the UI.
 */
export const FEATURE_CATEGORIES: Record<string, string[]> =
  MATRIX_FEATURE_CATEGORIES;

/** All plan types in display order */
export const PLAN_TYPES = ["starter", "pro", "business"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];
