// =====================================================
// Feature Flags Service
// =====================================================
// Business logic for checking feature availability based on plans

import type { PlanType } from "@/lib/types";
import type { FeatureKey } from "@/lib/types/domain";
import * as featuresRepo from "@/lib/repositories/features";
import * as salonsRepo from "@/lib/repositories/salons";
import * as profilesService from "@/lib/services/profiles-service";
import { hasPermission, type UserRole } from "@/lib/utils/access-control";

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

/**
 * Check if a user has access to a specific feature
 * Combines feature availability (plan-based) with user role permissions
 * 
 * @param userId - User ID to check
 * @param featureKey - Feature key to check
 * @param requiredRole - Minimum role required to access the feature (default: "manager")
 * @returns Object with hasFeature boolean and error string
 */
export async function hasFeatureForUser(
  userId: string,
  featureKey: FeatureKey,
  requiredRole: UserRole = "manager"
): Promise<{ hasFeature: boolean; error: string | null }> {
  try {
    // Get user profile to find salon_id and role
    const { data: profile, error: profileError } = await profilesService.getProfileForUser(userId);

    if (profileError || !profile) {
      return { hasFeature: false, error: profileError || "User profile not found" };
    }

    // Superadmin has access to everything
    if (profile.is_superadmin) {
      return { hasFeature: true, error: null };
    }

    // Check if user has a salon
    if (!profile.salon_id) {
      return { hasFeature: false, error: "User is not associated with a salon" };
    }

    // Check if salon has the feature
    const { hasFeature: salonHasFeature, error: featureError } = await hasFeature(
      profile.salon_id,
      featureKey
    );

    if (featureError) {
      return { hasFeature: false, error: featureError };
    }

    if (!salonHasFeature) {
      return { hasFeature: false, error: null };
    }

    // Check if user's role has permission to access the feature
    const userRole = (profile.role || "staff") as UserRole;
    const userHasPermission = hasPermission(userRole, requiredRole);

    if (!userHasPermission) {
      return { hasFeature: false, error: null };
    }

    return { hasFeature: true, error: null };
  } catch (err) {
    return {
      hasFeature: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

