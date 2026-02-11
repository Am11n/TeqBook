// =====================================================
// Feature Limits Config
// =====================================================
// Typed configuration for how each feature's limit is
// displayed and edited in the Plan Features matrix.
// This avoids free-text chaos in limit_value.

export type LimitType = "none" | "numeric";

export type FeatureLimitConfig = {
  limitType: LimitType;
  /** Unit label shown next to numeric input (e.g. "languages") */
  unit?: string;
};

/**
 * Defines how each feature key handles limits in the admin UI.
 * - "none": checkbox only, no limit input (on/off)
 * - "numeric": checkbox + number input with unit label; null = unlimited
 */
export const FEATURE_LIMITS: Record<string, FeatureLimitConfig> = {
  BOOKINGS:            { limitType: "none" },
  CALENDAR:            { limitType: "none" },
  SHIFTS:              { limitType: "none" },
  ADVANCED_REPORTS:    { limitType: "none" },
  MULTILINGUAL:        { limitType: "numeric", unit: "languages" },
  SMS_NOTIFICATIONS:   { limitType: "numeric", unit: "per month" },
  EMAIL_NOTIFICATIONS: { limitType: "none" },
  WHATSAPP:            { limitType: "none" },
  INVENTORY:           { limitType: "none" },
  BRANDING:            { limitType: "none" },
  ROLES_ACCESS:        { limitType: "none" },
  EXPORTS:             { limitType: "none" },
  CUSTOMER_HISTORY:    { limitType: "none" },
  ONLINE_PAYMENTS:     { limitType: "none" },
  SUPPORT:             { limitType: "none" },
};

/**
 * Category grouping for the matrix UI.
 * Order of keys = order of sections in the UI.
 * Order of values = order of features within each section.
 */
export const FEATURE_CATEGORIES: Record<string, string[]> = {
  "Booking & Calendar":  ["BOOKINGS", "CALENDAR"],
  "Staff & Operations":  ["SHIFTS", "ROLES_ACCESS"],
  "Notifications":       ["SMS_NOTIFICATIONS", "EMAIL_NOTIFICATIONS", "WHATSAPP"],
  "Reporting & Data":    ["ADVANCED_REPORTS", "EXPORTS", "CUSTOMER_HISTORY"],
  "Products & Payments": ["INVENTORY", "ONLINE_PAYMENTS"],
  "Support":             ["SUPPORT"],
  "Branding & Language": ["BRANDING", "MULTILINGUAL"],
};

/** All plan types in display order */
export const PLAN_TYPES = ["starter", "pro", "business"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];
