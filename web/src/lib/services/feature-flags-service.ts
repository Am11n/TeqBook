// =====================================================
// Feature Flags Service
// =====================================================
// Business logic for checking feature availability based on plans

import type { PlanType } from "@/lib/types";
import type { FeatureKey } from "@/lib/types/domain";
import * as featuresRepo from "@/lib/repositories/features";
import * as salonsRepo from "@/lib/repositories/salons";

/**
 * Check if a salon has access to a specific feature
 */
export async function hasFeature(
  salonId: string,
  featureKey: FeatureKey
): Promise<{ hasFeature: boolean; error: string | null }> {
  try {
    // Get salon to find plan
    const { data: salon, error: salonError } = await salonsRepo.getSalonById(salonId);

    if (salonError || !salon) {
      return { hasFeature: false, error: salonError || "Salon not found" };
    }

    const plan = (salon.plan || "starter") as PlanType;

    // Get features for this plan
    const { data: planFeatures, error: featuresError } =
      await featuresRepo.getFeaturesForPlan(plan);

    if (featuresError) {
      return { hasFeature: false, error: featuresError };
    }

    // Check if feature is in plan
    const hasFeature = planFeatures?.some(
      (pf) => pf.feature.key === featureKey
    ) || false;

    // TODO: Check custom_feature_overrides if implemented
    // if (salon.custom_feature_overrides) {
    //   const overrides = salon.custom_feature_overrides as Record<string, boolean>;
    //   if (overrides[featureKey] !== undefined) {
    //     return { hasFeature: overrides[featureKey], error: null };
    //   }
    // }

    return { hasFeature, error: null };
  } catch (err) {
    return {
      hasFeature: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get all features available for a salon based on its plan
 */
export async function getFeaturesForSalon(
  salonId: string
): Promise<{ features: FeatureKey[]; error: string | null }> {
  try {
    // Get salon to find plan
    const { data: salon, error: salonError } = await salonsRepo.getSalonById(salonId);

    if (salonError || !salon) {
      return { features: [], error: salonError || "Salon not found" };
    }

    const plan = (salon.plan || "starter") as PlanType;

    // Get feature keys for this plan
    const { data: featureKeys, error: featuresError } =
      await featuresRepo.getFeatureKeysForPlan(plan);

    if (featuresError) {
      return { features: [], error: featuresError };
    }

    // TODO: Merge with custom_feature_overrides if implemented
    // if (salon.custom_feature_overrides) {
    //   const overrides = salon.custom_feature_overrides as Record<string, boolean>;
    //   const additionalFeatures = Object.keys(overrides)
    //     .filter((key) => overrides[key] === true)
    //     .filter((key) => !featureKeys?.includes(key as FeatureKey))
    //     .map((key) => key as FeatureKey);
    //   return { features: [...(featureKeys || []), ...additionalFeatures], error: null };
    // }

    return { features: featureKeys || [], error: null };
  } catch (err) {
    return {
      features: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get feature limit for a salon and feature
 * Returns null if unlimited or no limit
 */
export async function getFeatureLimit(
  salonId: string,
  featureKey: FeatureKey
): Promise<{ limit: number | null; error: string | null }> {
  try {
    // Get salon to find plan
    const { data: salon, error: salonError } = await salonsRepo.getSalonById(salonId);

    if (salonError || !salon) {
      return { limit: null, error: salonError || "Salon not found" };
    }

    const plan = (salon.plan || "starter") as PlanType;

    // Get features for this plan
    const { data: planFeatures, error: featuresError } =
      await featuresRepo.getFeaturesForPlan(plan);

    if (featuresError) {
      return { limit: null, error: featuresError };
    }

    // Find the feature and its limit
    const planFeature = planFeatures?.find((pf) => pf.feature.key === featureKey);

    if (!planFeature) {
      return { limit: null, error: "Feature not available in plan" };
    }

    return { limit: planFeature.limit_value, error: null };
  } catch (err) {
    return {
      limit: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

