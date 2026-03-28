import type { MatrixFeatureKey } from "./matrix-feature-keys";

/**
 * Admin Plan Features matrix: display copy that may differ from `features.name` /
 * `features.description` in the database (e.g. until migrations are applied, or
 * to keep product wording consistent in the UI).
 */
export const FEATURE_DISPLAY_OVERRIDES: Partial<
  Record<MatrixFeatureKey, { name: string; description: string }>
> = {
  WHATSAPP: {
    name: "WhatsApp",
    description: "Customer communication",
  },
};

export function getPlanFeatureDisplay(feature: {
  key: string;
  name: string;
  description: string | null;
}): { name: string; description: string } {
  const o = FEATURE_DISPLAY_OVERRIDES[feature.key as MatrixFeatureKey];
  return {
    name: o?.name ?? feature.name,
    description: o?.description ?? feature.description ?? feature.key,
  };
}
