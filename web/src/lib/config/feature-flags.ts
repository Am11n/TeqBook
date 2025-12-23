// =====================================================
// Feature Flags Configuration
// =====================================================
// Internal feature flags for experiments, beta features, and gradual rollouts
// These are independent of plan-based features and can be toggled per environment

/**
 * Feature flags that are independent of subscription plans.
 * Used for experiments, beta features, and gradual rollouts.
 */
export const featureFlags = {
  /**
   * New booking flow with improved UX
   * When enabled, uses the new booking creation flow
   */
  newBookingFlow: {
    enabled: false,
    description: "New booking flow with improved UX",
  },

  /**
   * Beta version of employee shift management
   * When enabled, shows enhanced shift management features
   */
  employeeShiftBeta: {
    enabled: false,
    description: "Beta version of employee shift management",
  },

  /**
   * New dashboard design with improved layout
   * When enabled, shows the redesigned dashboard
   */
  newDashboardDesign: {
    enabled: false,
    description: "New dashboard design with improved layout",
  },

  /**
   * Enhanced reporting features
   * When enabled, shows additional reporting capabilities
   */
  enhancedReporting: {
    enabled: false,
    description: "Enhanced reporting features",
  },

  /**
   * Real-time notifications
   * When enabled, uses WebSocket for real-time updates
   */
  realtimeNotifications: {
    enabled: false,
    description: "Real-time notifications via WebSocket",
  },

  /**
   * Advanced inventory management
   * When enabled, shows advanced inventory features
   */
  advancedInventory: {
    enabled: false,
    description: "Advanced inventory management features",
  },
} as const;

export type FeatureFlagKey = keyof typeof featureFlags;

/**
 * Check if a feature flag is enabled
 * @param flagKey - The feature flag key to check
 * @returns true if the feature flag is enabled, false otherwise
 */
export function isFeatureFlagEnabled(flagKey: FeatureFlagKey): boolean {
  return featureFlags[flagKey]?.enabled ?? false;
}

/**
 * Get all enabled feature flags
 * @returns Array of enabled feature flag keys
 */
export function getEnabledFeatureFlags(): FeatureFlagKey[] {
  return Object.keys(featureFlags).filter(
    (key) => isFeatureFlagEnabled(key as FeatureFlagKey)
  ) as FeatureFlagKey[];
}

/**
 * Get feature flag description
 * @param flagKey - The feature flag key
 * @returns Description of the feature flag
 */
export function getFeatureFlagDescription(flagKey: FeatureFlagKey): string {
  return featureFlags[flagKey]?.description ?? "";
}

/**
 * Environment-based feature flags
 * Can be overridden via environment variables
 */
export function getEnvironmentFeatureFlags(): Partial<Record<FeatureFlagKey, boolean>> {
  // Check environment variables for feature flags
  // Format: NEXT_PUBLIC_FEATURE_FLAG_<FLAG_NAME>=true
  const envFlags: Partial<Record<FeatureFlagKey, boolean>> = {};

  if (typeof window !== "undefined") {
    // Client-side: check environment variables
    Object.keys(featureFlags).forEach((key) => {
      const envKey = `NEXT_PUBLIC_FEATURE_FLAG_${key.toUpperCase()}`;
      const envValue = process.env[envKey];
      if (envValue === "true") {
        envFlags[key as FeatureFlagKey] = true;
      }
    });
  }

  return envFlags;
}

/**
 * Check if a feature flag is enabled (including environment overrides)
 * @param flagKey - The feature flag key to check
 * @returns true if the feature flag is enabled, false otherwise
 */
export function isFeatureFlagEnabledWithEnv(flagKey: FeatureFlagKey): boolean {
  const envFlags = getEnvironmentFeatureFlags();
  
  // Environment variables override default values
  if (envFlags[flagKey] !== undefined) {
    return envFlags[flagKey] ?? false;
  }

  return isFeatureFlagEnabled(flagKey);
}

